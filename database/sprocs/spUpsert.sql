IF OBJECT_ID('DotF.spUpsert') IS NOT NULL DROP PROCEDURE DotF.spUpsert;
GO

CREATE PROCEDURE DotF.spUpsert
	@Schema VARCHAR(255) = 'DotF',
	@Target VARCHAR(255),
	@JSON NVARCHAR(MAX)
AS
BEGIN
	-- Check if table exists
	IF NOT EXISTS (SELECT 1
	FROM INFORMATION_SCHEMA.TABLES
	WHERE TABLE_NAME = @Target AND TABLE_SCHEMA = @Schema)
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
		Data NVARCHAR(MAX)
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
			(Data)
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
	WHERE TABLE_NAME = @Target
		AND TABLE_SCHEMA = @Schema
	ORDER BY ORDINAL_POSITION

	SELECT
		@Columns += CASE 
                    WHEN COLUMN_NAME IN ('Data', 'Tags', 'Meta') THEN 'JSON_QUERY(Data, ''$.' + COLUMN_NAME + ''') as ' + COLUMN_NAME + ', '
                    ELSE 'JSON_VALUE(Data, ''$.' + COLUMN_NAME + ''') as ' + COLUMN_NAME + ', '
                END,
		@InsertColumns += CASE WHEN COLUMN_NAME <> @PKColumn THEN COLUMN_NAME + ', ' ELSE '' END,
		@UpdateColumns += CASE WHEN COLUMN_NAME <> @PKColumn THEN COLUMN_NAME + ' = Source.' + COLUMN_NAME + ', ' ELSE '' END
	FROM INFORMATION_SCHEMA.COLUMNS
	WHERE TABLE_NAME = @Target
		AND TABLE_SCHEMA = @Schema

	-- Trim trailing commas and spaces
	SET @Columns = LEFT(@Columns, LEN(@Columns) - 1)
	SET @InsertColumns = LEFT(@InsertColumns, LEN(@InsertColumns) - 1)
	SET @UpdateColumns = LEFT(@UpdateColumns, LEN(@UpdateColumns) - 1)

	SET @SQL = N'
        MERGE INTO ' + @Schema + '.' + @Target + ' AS Target
        USING (
            SELECT ' + @Columns + ' 
            FROM #ParsedData
        ) AS Source
        ON Target.' + @PKColumn + ' = Source.' + @PKColumn + '
        WHEN MATCHED THEN 
            UPDATE SET ' + @UpdateColumns + '
        WHEN NOT MATCHED THEN 
            INSERT (' + @InsertColumns + ') 
            VALUES (Source.' + REPLACE(@InsertColumns, ',', ', Source.') + ')
        OUTPUT inserted.*;
    '

	-- Execute the dynamic SQL
	EXEC sp_executesql @SQL

	-- Drop the temp table
	DROP TABLE #ParsedData
END
