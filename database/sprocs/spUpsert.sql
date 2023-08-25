IF OBJECT_ID('DotF.spUpsert') IS NOT NULL DROP PROCEDURE DotF.spUpsert;
GO

CREATE PROCEDURE DotF.spUpsert
    @Schema VARCHAR(255) = 'DotF',
    @Table VARCHAR(255),
    @JSON NVARCHAR(MAX)
AS
BEGIN
    -- Check if table exists
    IF NOT EXISTS (SELECT 1
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = @Table AND TABLE_SCHEMA = @Schema)
    BEGIN
        RAISERROR('Table does not exist.', 16, 1)
        RETURN
    END

    DECLARE @IsArray BIT

    -- Check if JSON is an array or object
    IF LEFT(LTRIM(@JSON), 1) = '['
        SET @IsArray = 1
    ELSE
        SET @IsArray = 0

    -- Create a temp table to parse the JSON to
    CREATE TABLE #ParsedData
    (
        Id INT IDENTITY(1, 1),
        JSONData NVARCHAR(MAX)
    )

    -- Add the JSON data to the table
    IF @IsArray = 1
    BEGIN
        INSERT INTO #ParsedData
        SELECT value
        FROM OPENJSON(@JSON)
    END
    ELSE
    BEGIN
        INSERT INTO #ParsedData
            (JSONData)
        VALUES
            (@JSON)
    END

    -- Here we start the dynamic SQL
    DECLARE @SQL NVARCHAR(MAX)
    DECLARE @PKColumn NVARCHAR(255)
    DECLARE @Columns NVARCHAR(MAX) = ''
    DECLARE @InsertColumns NVARCHAR(MAX) = ''
    DECLARE @UpdateColumns NVARCHAR(MAX) = ''

    -- Assuming PK is always first column in INFORMATION_SCHEMA.COLUMNS for the table
    SELECT TOP 1
        @PKColumn = COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = @Table
        AND TABLE_SCHEMA = @Schema
    ORDER BY ORDINAL_POSITION

    SELECT
        @Columns += CASE 
                    WHEN COLUMN_NAME = 'Base64' THEN 'Base64Data.Base64, '
                    WHEN COLUMN_NAME = 'UUID' THEN 'ISNULL(JSON_VALUE(JSONData, ''$.UUID''), NEWID()) as UUID, '
                    WHEN COLUMN_NAME IN ('Tags', 'Meta') THEN 'JSON_QUERY(JSONData, ''$.' + COLUMN_NAME + ''') as ' + COLUMN_NAME + ', '
                    ELSE 'JSON_VALUE(JSONData, ''$.' + COLUMN_NAME + ''') as ' + COLUMN_NAME + ', '
                    END,
        @InsertColumns += CASE WHEN COLUMN_NAME <> @PKColumn THEN COLUMN_NAME + ', ' ELSE '' END,
        @UpdateColumns += CASE WHEN COLUMN_NAME <> @PKColumn THEN COLUMN_NAME + ' = Source.' + COLUMN_NAME + ', ' ELSE '' END
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
        TABLE_NAME = @Table
        AND TABLE_SCHEMA = @Schema

    -- Trim trailing commas and spaces
    SET @Columns = LEFT(@Columns, LEN(@Columns) - 1)
    SET @InsertColumns = LEFT(@InsertColumns, LEN(@InsertColumns) - 1)
    SET @UpdateColumns = LEFT(@UpdateColumns, LEN(@UpdateColumns) - 1)

    SET @SQL = N'
        SELECT Id, Base64
        INTO #Base64Data
        FROM #ParsedData
        CROSS APPLY OPENJSON(JSONData)
        WITH (
            Base64 NVARCHAR(MAX) ''$.Base64''
        );

        MERGE INTO ' + @Schema + '.' + @Table + ' AS Target
        USING (
            SELECT ' + @Columns + ' 
            FROM #ParsedData
            INNER JOIN #Base64Data AS Base64Data ON #ParsedData.Id = Base64Data.Id
        ) AS Source
        ON Target.' + @PKColumn + ' = Source.' + @PKColumn + '
        WHEN MATCHED THEN 
            UPDATE SET ' + @UpdateColumns + '
        WHEN NOT MATCHED THEN 
            INSERT (' + @InsertColumns + ') 
            VALUES (Source.' + REPLACE(@InsertColumns, ',', ', Source.') + ')
        OUTPUT inserted.*;

        DROP TABLE #Base64Data;
    '

    -- Execute the dynamic SQL
    EXEC sp_executesql @SQL

    -- Drop the temp table
    DROP TABLE #ParsedData
END