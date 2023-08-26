-- CREATE DATABASE FuzzyKnights
-- GO


-- CREATE SCHEMA DotF
-- GO

USE FuzzyKnights
GO


IF OBJECT_ID('DotF.MapTile') IS NOT NULL DROP TABLE DotF.MapTile;
IF OBJECT_ID('DotF.Map') IS NOT NULL DROP TABLE DotF.Map;
IF OBJECT_ID('DotF.Terrain') IS NOT NULL DROP TABLE DotF.Terrain;

IF OBJECT_ID('DotF.SpriteSheetSprite') IS NOT NULL DROP TABLE DotF.SpriteSheetSprite;
IF OBJECT_ID('DotF.SpriteSheet') IS NOT NULL DROP TABLE DotF.SpriteSheet;
IF OBJECT_ID('DotF.Sprite') IS NOT NULL DROP TABLE DotF.Sprite;
IF OBJECT_ID('DotF.Step') IS NOT NULL DROP TABLE DotF.Step;
IF OBJECT_ID('DotF.Frame') IS NOT NULL DROP TABLE DotF.Frame;
IF OBJECT_ID('DotF.Cadence') IS NOT NULL DROP TABLE DotF.Cadence;
IF OBJECT_ID('DotF.[Sequence]') IS NOT NULL DROP TABLE DotF.[Sequence];
IF OBJECT_ID('DotF.Texture') IS NOT NULL DROP TABLE DotF.Texture;

IF OBJECT_ID('DotF.Namespace') IS NOT NULL DROP TABLE DotF.[Namespace];

IF OBJECT_ID('DotF.EnumMapType') IS NOT NULL DROP TABLE DotF.EnumMapType;
GO


CREATE TABLE DotF.EnumMapType (
	EnumMapTypeID INT IDENTITY(1, 1) PRIMARY KEY,
	[Key] VARCHAR(255) NOT NULL UNIQUE,
	[Value] VARCHAR(255) NOT NULL UNIQUE
);
INSERT INTO DotF.EnumMapType ([Key], [Value])
VALUES
	('OVERWORLD', 'overworld'),
	('CAVE', 'cave'),
	('DUNGEON', 'dungeon'),
	('TOWN', 'town'),
	('BUILDING', 'building'),
	('SANCTUARY', 'sanctuary');


CREATE TABLE DotF.[Namespace] (
	NamespaceID INT IDENTITY(1, 1) PRIMARY KEY,
	ParentNamespaceID INT FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID),
	[Name] VARCHAR(255) NOT NULL,
	
	[Tags] NVARCHAR(MAX) NULL,
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
);
INSERT INTO DotF.[Namespace] (ParentNamespaceID, [Name])
VALUES
	(NULL, 'DotF'),
	(1, 'Assets'),
	(1, 'World');


CREATE TABLE DotF.Texture (
	TextureID INT IDENTITY(1, 1) PRIMARY KEY,
	[Name] VARCHAR(255) NOT NULL,
	[Base64] VARCHAR(MAX) NOT NULL,
	Width INT NOT NULL,
	Height INT NOT NULL,
	[Hash] VARCHAR(255) NOT NULL UNIQUE,
	
	[Tags] NVARCHAR(MAX) NULL,
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 2,
);


CREATE TABLE DotF.[Sequence] (
	SequenceID INT IDENTITY(1, 1) PRIMARY KEY,
	[Name] VARCHAR(255) NOT NULL,
	
	[Tags] NVARCHAR(MAX) NULL,
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 2,
);
CREATE TABLE DotF.Frame (
	FrameID INT IDENTITY(1, 1) PRIMARY KEY,
	SequenceID INT FOREIGN KEY REFERENCES DotF.[Sequence](SequenceID),
	TextureID INT FOREIGN KEY REFERENCES DotF.Texture(TextureID),
	[Order] INT NOT NULL,
	
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 2,
);


CREATE TABLE DotF.Cadence (
	CadenceID INT IDENTITY(1, 1) PRIMARY KEY,
	[Name] VARCHAR(255) NOT NULL UNIQUE,
	IsRelative BIT NOT NULL DEFAULT 0,
	
	[Tags] NVARCHAR(MAX) NULL,
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 2,
);
INSERT INTO DotF.Cadence ([Name], IsRelative)
VALUES
	('EqualUnit', 1);
CREATE TABLE DotF.Step (
	StepID INT IDENTITY(1, 1) PRIMARY KEY,
	CadenceID INT FOREIGN KEY REFERENCES DotF.Cadence(CadenceID),
	Duration INT NOT NULL,
	
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 2,
);
INSERT INTO DotF.Step (CadenceID, Duration)
VALUES
	(1, 1);


/**
* The Sprite is the most basic unit of animation
* comprised of a Sequence and a Cadence.  The Sequence
* is a collection of Frames, and the Cadence is a collection
* of Steps.  The Cadence is used to determine the timing
* of the animation, and the Sequence is used to determine
* the order of the animation.

* An example would be a Sprite of a character walking in
* a particular direction (e.g. entity-creature-bear-walking-0)
*/
CREATE TABLE DotF.Sprite (
	SpriteID INT IDENTITY(1, 1) PRIMARY KEY,
	[Name] VARCHAR(255) NOT NULL UNIQUE,
	SequenceID INT FOREIGN KEY REFERENCES DotF.[Sequence](SequenceID),
	CadenceID INT FOREIGN KEY REFERENCES DotF.Cadence(CadenceID),
	
	[Tags] NVARCHAR(MAX) NULL,
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 2,
);
/**
* The SpriteSheet is a collection of Sprites, acting as a
* container that group.  As a Sprite is typically state-directional,
* the SpriteSheet (with no parent) would represent just the state
* (e.g. entity-creature-bear-walking).  The SpriteSheet with a parent
* would represent the next level up (e.g. entity-creature-bear), etc.
*/
CREATE TABLE DotF.SpriteSheet (
	SpriteSheetID INT IDENTITY(1, 1) PRIMARY KEY,
	ParentSpriteSheetID INT FOREIGN KEY REFERENCES DotF.SpriteSheet(SpriteSheetID),		-- Allow for easy groupings (e.g. all the sprites for an entity)
	[Name] VARCHAR(255) NOT NULL UNIQUE,
	
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 2,
);
/**
* The mapping table to associate (and order) a Sprite to
* a SpriteSheet.  This allows for a Sprite to be used in
* multiple SpriteSheets, and for a SpriteSheet to contain
* multiple Sprites.
*/
CREATE TABLE DotF.SpriteSheetSprite (
	SpriteSheetSpriteID INT IDENTITY(1, 1) PRIMARY KEY,
	SpriteSheetID INT FOREIGN KEY REFERENCES DotF.SpriteSheet(SpriteSheetID),
	SpriteID INT FOREIGN KEY REFERENCES DotF.Sprite(SpriteID),
	[Order] INT NOT NULL,
	
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 2,
);


CREATE TABLE DotF.Terrain (
	TerrainID INT IDENTITY(1, 1) PRIMARY KEY,
	[Name] VARCHAR(255) NOT NULL,
	Cost INT NOT NULL,
	Mask INT NULL DEFAULT 0,
	[Data] NVARCHAR(MAX) NULL,

	[Tags] NVARCHAR(MAX) NULL,
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 3,
);
CREATE TABLE DotF.Map (
	MapID INT IDENTITY(1, 1) PRIMARY KEY,
	ParentMapID INT FOREIGN KEY REFERENCES DotF.Map(MapID),
	EnumMapTypeID INT FOREIGN KEY REFERENCES DotF.EnumMapType(EnumMapTypeID) DEFAULT 1,
	[Name] VARCHAR(255) NOT NULL,
	[Rows] INT NOT NULL,
	[Columns] INT NOT NULL,

	[Tags] NVARCHAR(MAX) NULL,
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 3,
);
CREATE TABLE DotF.MapTile (
	MapTileID INT IDENTITY(1, 1) PRIMARY KEY,
	MapID INT FOREIGN KEY REFERENCES DotF.Map(MapID),
	TerrainID INT FOREIGN KEY REFERENCES DotF.Terrain(TerrainID),
	[Row] INT NOT NULL,
	[Column] INT NOT NULL,
	
	[Tags] NVARCHAR(MAX) NULL,
	Meta NVARCHAR(MAX) NULL,
	UUID UNIQUEIDENTIFIER NULL UNIQUE DEFAULT NEWID(),
	NamespaceID INT NULL FOREIGN KEY REFERENCES DotF.[Namespace](NamespaceID) DEFAULT 3,
);