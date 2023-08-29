IF OBJECT_ID('DotF.sfSortableKey') IS NOT NULL DROP FUNCTION DotF.sfSortableKey;
GO

CREATE FUNCTION DotF.sfSortableKey (@Namespace NVARCHAR(MAX))
RETURNS NVARCHAR(MAX)
AS
BEGIN
    DECLARE @Key NVARCHAR(MAX) = ''
    DECLARE @Part NVARCHAR(MAX)
    DECLARE @Pos INT

    WHILE CHARINDEX('-', @Namespace) > 0
    BEGIN
        SET @Pos = CHARINDEX('-', @Namespace)
        SET @Part = LEFT(@Namespace, @Pos - 1)
        SET @Key = @Key + RIGHT('0000' + @Part, 4) + '-'
        SET @Namespace = RIGHT(@Namespace, LEN(@Namespace) - @Pos)
    END

    SET @Key = @Key + RIGHT('0000' + @Namespace, 4)

    RETURN @Key
END