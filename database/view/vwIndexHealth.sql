IF OBJECT_ID('DotF.vwIndexHealth') IS NOT NULL DROP VIEW DotF.vwIndexHealth;
GO

CREATE VIEW DotF.vwIndexHealth AS
SELECT
    OBJECT_SCHEMA_NAME(ips.object_id) AS SchemaName,
    OBJECT_NAME(ips.object_id) AS TableName,
    i.name AS IndexName,
    i.type_desc AS IndexType,
    CASE
        WHEN ips.avg_fragmentation_in_percent < 10 THEN 'NOOP'
        WHEN ips.avg_fragmentation_in_percent BETWEEN 10 AND 30 THEN 'REORGANIZE'
        ELSE 'REBUILD'
    END AS SuggestedAction,
    ips.avg_fragmentation_in_percent AS Fragmentation
FROM
    sys.dm_db_index_physical_stats (NULL, NULL, NULL, NULL, NULL) AS ips
    INNER JOIN sys.indexes AS i
        ON ips.object_id = i.object_id AND ips.index_id = i.index_id
WHERE
    OBJECT_SCHEMA_NAME(ips.object_id) = 'DotF';