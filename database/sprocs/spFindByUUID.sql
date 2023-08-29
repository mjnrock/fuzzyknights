IF OBJECT_ID('DotF.spFindByUUID') IS NOT NULL DROP PROCEDURE DotF.spFindByUUID;
GO

CREATE PROCEDURE DotF.spFindByUUID
    @Schema NVARCHAR(255),
    @UUIDs NVARCHAR(MAX)  -- comma-separated list or JSON array of UUIDs
AS
BEGIN

    -- Create a table to store UUIDs for the search
    CREATE TABLE #UUIDList (UUID UNIQUEIDENTIFIER);

    -- Check if @UUIDs is a JSON array
    IF ISJSON(@UUIDs) = 1 AND LEFT(@UUIDs, 1) = '[' AND RIGHT(@UUIDs, 1) = ']'
    BEGIN
        INSERT INTO #UUIDList (UUID)
        SELECT CONVERT(UNIQUEIDENTIFIER, value)
        FROM OPENJSON(@UUIDs)
    END
    ELSE
    BEGIN
        -- If not a JSON array, assume it's a comma-separated list and populate the UUID table
        INSERT INTO #UUIDList (UUID)
        SELECT CONVERT(UNIQUEIDENTIFIER, value)
        FROM STRING_SPLIT(@UUIDs, ',')
    END

    -- Table to store the results
    CREATE TABLE #Results (SchemaName NVARCHAR(255), TableName NVARCHAR(255), PKID NVARCHAR(255), UUID UNIQUEIDENTIFIER, Data NVARCHAR(MAX));

    DECLARE @TableName NVARCHAR(255);
    DECLARE @PKColumnName NVARCHAR(255);
    DECLARE @Sql NVARCHAR(MAX);

    -- Cursor to loop through each table in the schema which has a column named 'UUID'
    DECLARE cur CURSOR FOR
    SELECT TABLE_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @Schema 
    AND COLUMN_NAME = 'UUID';

    OPEN cur;
    FETCH NEXT FROM cur INTO @TableName;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Get the Primary Key Column name
        SELECT TOP 1 @PKColumnName = col.name
        FROM sys.key_constraints kc
        JOIN sys.index_columns idxCol ON kc.parent_object_id = idxCol.object_id
        JOIN sys.columns col ON idxCol.column_id = col.column_id AND col.object_id = idxCol.object_id
        WHERE kc.type = 'PK' 
        AND OBJECT_SCHEMA_NAME(kc.parent_object_id) = @Schema
        AND OBJECT_NAME(kc.parent_object_id) = @TableName;

        -- Dynamic SQL to search for the UUID in the current table's 'UUID' column and get the row as JSON
        SET @Sql = 'INSERT INTO #Results (SchemaName, TableName, PKID, UUID, Data) ' +
                   'SELECT ''' + @Schema + ''', ''' + @TableName + ''', [' + @PKColumnName + '], UUID, ' +
                   'CAST((SELECT * FROM [' + @Schema + '].[' + @TableName + '] WHERE UUID = u.UUID FOR JSON PATH, WITHOUT_ARRAY_WRAPPER, INCLUDE_NULL_VALUES) AS NVARCHAR(MAX)) ' +
                   'FROM [' + @Schema + '].[' + @TableName + '] u ' +
                   'WHERE UUID IN (SELECT UUID FROM #UUIDList)';

        EXEC sp_executesql @Sql;

        FETCH NEXT FROM cur INTO @TableName;
    END;

    CLOSE cur;
    DEALLOCATE cur;

    -- Return the results
    SELECT SchemaName, TableName, PKID, UUID, Data
    FROM #Results
    ORDER BY TableName;

    -- Cleanup temp tables
    DROP TABLE #UUIDList;
    DROP TABLE #Results;

END;