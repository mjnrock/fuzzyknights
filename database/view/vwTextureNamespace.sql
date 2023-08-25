IF OBJECT_ID('DotF.vwTextureNamespace') IS NOT NULL DROP VIEW DotF.vwTextureNamespace;
GO

CREATE VIEW DotF.vwTextureNamespace AS
WITH Namespaces AS (
    SELECT
        [Name],
        LEFT([Name], CHARINDEX('-', [Name] + '-') - 1) AS [Entry],
        CASE 
            WHEN CHARINDEX('-', [Name] + '-') = LEN([Name]) + 1 THEN '' 
            ELSE RIGHT([Name], LEN([Name]) - CHARINDEX('-', [Name])) 
        END AS Remaining,
        1 AS [Level],
        CAST('' AS NVARCHAR(MAX)) AS [Namespace],
        CAST(NULL AS NVARCHAR(MAX)) AS ParentNamespace
    FROM DotF.Texture

    UNION ALL

    SELECT
        Namespaces.[Name],
        LEFT(Remaining, CHARINDEX('-', Remaining + '-') - 1),
        CASE 
            WHEN CHARINDEX('-', Remaining + '-') = LEN(Remaining) + 1 THEN '' 
            ELSE RIGHT(Remaining, LEN(Remaining) - CHARINDEX('-', Remaining)) 
        END,
        [Level] + 1,
        CASE 
            WHEN Remaining <> '' THEN [Namespace] + [Entry] + '-' 
            ELSE [Namespace] + [Entry] 
        END,
        CASE 
            WHEN [Namespace] = '' THEN [Entry] 
            ELSE [Namespace] + [Entry]
        END
    FROM Namespaces
    WHERE Remaining <> '' OR [Level] = 1
),
Grouped AS (
    SELECT
        [Level],
        ParentNamespace,
        CASE 
            WHEN [Namespace] = '' THEN [Entry] 
            ELSE [Namespace] + [Entry]
        END AS [Namespace],
        COUNT(*) AS CountAtLevel
    FROM
        Namespaces
    GROUP BY
        [Level],
        ParentNamespace,
        CASE 
            WHEN [Namespace] = '' THEN [Entry] 
            ELSE [Namespace] + [Entry]
        END
)
SELECT TOP 100 PERCENT
    [Level],
    ParentNamespace,
    [Namespace],
    CountAtLevel
FROM
    Grouped
ORDER BY
    [Level],
    DotF.sfSortableKey([Namespace]);