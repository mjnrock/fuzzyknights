IF OBJECT_ID('DotF.spRepairIndexes') IS NOT NULL DROP PROCEDURE DotF.spRepairIndexes;
GO

CREATE PROCEDURE DotF.spRepairIndexes
AS
BEGIN
    DECLARE @SchemaName NVARCHAR(255);
    DECLARE @TableName NVARCHAR(255);
    DECLARE @IndexName NVARCHAR(255);
    DECLARE @Action NVARCHAR(50);
    DECLARE @Sql NVARCHAR(MAX);

    DECLARE cur CURSOR FOR
    SELECT
        SchemaName,
        TableName,
        IndexName,
        SuggestedAction
    FROM
        DotF.vwIndexHealth;

    OPEN cur;
    FETCH NEXT FROM cur INTO @SchemaName, @TableName, @IndexName, @Action;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @Sql = '';

        IF @Action = 'REORGANIZE'
        BEGIN
            SET @Sql = 'ALTER INDEX [' + @IndexName + '] ON [DotF].[' + @TableName + '] REORGANIZE;';
        END
        ELSE IF @Action = 'REBUILD'
        BEGIN
            SET @Sql = 'ALTER INDEX [' + @IndexName + '] ON [DotF].[' + @TableName + '] REBUILD;';
        END

        IF LEN(@Sql) > 0
        BEGIN
            EXEC sp_executesql @Sql;
        END

        FETCH NEXT FROM cur INTO @SchemaName, @TableName, @IndexName, @Action;
    END

    CLOSE cur;
    DEALLOCATE cur;
END;