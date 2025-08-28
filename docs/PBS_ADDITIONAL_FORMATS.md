# Additional PBS File Formats Documentation

This document contains documentation for additional Pokemon Essentials PBS files.

## Table of Contents
1. [encounters.txt - Wild Pokemon Encounters](#encounterstxt---wild-pokemon-encounters)
2. [map_metadata.txt - Map Properties](#map_metadatatxt---map-properties)
3. [map_connections.txt - Map Connections](#map_connectionstxt---map-connections)
4. [town_map.txt - Town Map Configuration](#town_maptxt---town-map-configuration)
5. [types.txt - Type Effectiveness](#typestxt---type-effectiveness)
6. [abilities.txt - Pokemon Abilities](#abilitiestxt---pokemon-abilities)
7. [berry_plants.txt - Berry Configuration](#berry_plantstxt---berry-configuration)
8. [shadow_pokemon.txt - Shadow Pokemon](#shadow_pokemontxt---shadow-pokemon)

## encounters.txt - Wild Pokemon Encounters

### File Format
```
[MapID]  # or [MapID,Version]
EncounterType,Density
    Weight,Species,MinLevel,MaxLevel
```

### Encounter Types

#### Standard Encounter Types
- `Land` - Regular grass encounters
- `Cave` - Cave floor encounters
- `Water` - Surfing encounters

#### Time-Based Variants
Each standard type can have time-specific versions:
- `LandDay`, `LandNight`, `LandMorning`, `LandAfternoon`, `LandEvening`
- `CaveDay`, `CaveNight`, `CaveMorning`, `CaveAfternoon`, `CaveEvening`
- `WaterDay`, `WaterNight`, `WaterMorning`, `WaterAfternoon`, `WaterEvening`

#### Special Encounter Types
- `OldRod` - Fishing with Old Rod
- `GoodRod` - Fishing with Good Rod
- `SuperRod` - Fishing with Super Rod
- `RockSmash` - Breaking rocks
- `HeadbuttLow` - Headbutting trees (common)
- `HeadbuttHigh` - Headbutting trees (rare)
- `BugContest` - Bug Catching Contest

### Encounter Parameters
- **Density**: Encounter rate (0-100, higher = more encounters)
- **Weight**: Relative chance of encountering (higher = more common)
- **MinLevel/MaxLevel**: Level range for the Pokemon

### Example Entry
```
[002]  # Route 1
Land,21
    20,PIDGEY,2,5
    20,RATTATA,2,5
    10,PIDGEY,3,5
    10,RATTATA,3,5
    10,PIDGEY,4,5
    10,RATTATA,4,5
    5,PIDGEY,5,5
    5,RATTATA,5,5
    5,PIDGEY,2,3
    5,RATTATA,2,3

LandNight,21
    20,RATTATA,2,5
    20,HOOTHOOT,2,5
    10,RATTATA,3,5
    10,HOOTHOOT,3,5

Water,2
    60,MAGIKARP,5,10
    30,GOLDEEN,5,10
    10,SEAKING,10,15

OldRod,100,2
    70,MAGIKARP,5,10
    30,GOLDEEN,5,10

GoodRod,100,2
    60,MAGIKARP,10,20
    20,GOLDEEN,10,20
    20,PSYDUCK,15,25
```

### Encounter Slot Structure
Most encounter types have specific slot counts:
- **Land/Cave**: 12 slots (20%, 20%, 10%, 10%, 10%, 10%, 5%, 5%, 5%, 5%)
- **Water**: 10 slots (60%, 30%, 5%, 4%, 1%)
- **Fishing**: 5 slots (70%, 30%, 0%, 0%, 0%) for OldRod
- **Fishing**: 5 slots (60%, 20%, 20%, 0%, 0%) for GoodRod
- **Fishing**: 5 slots (40%, 40%, 15%, 4%, 1%) for SuperRod

## map_metadata.txt - Map Properties

### File Format
```
[MapID]
Property = Value
```

### Key Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| Name | String | Map display name | "???" |
| Outdoor | Boolean | Enables day/night tinting | false |
| ShowArea | Boolean | Show map name on entry | false |
| Bicycle | Boolean | Allow bicycle usage | false |
| BicycleAlways | Boolean | Force bicycle usage | false |
| HealingSpot | Array | Pokemon Center respawn point | none |
| Weather | Array | Weather type, probability | none |
| MapPosition | Array | Region, X, Y coordinates | none |
| DiveMap | Integer | Underwater map ID | none |
| DarkMap | Boolean | Requires Flash | false |
| SafariMap | Boolean | Safari Zone rules | false |
| SnapEdges | Boolean | Prevent scrolling past edges | false |
| BattleBack | String | Battle background | auto |
| WildBattleBGM | String | Wild battle music | default |
| TrainerBattleBGM | String | Trainer battle music | default |
| WildVictoryBGM | String | Wild victory music | default |
| TrainerVictoryBGM | String | Trainer victory music | default |
| MapSize | String | Size code (0-2) | "1" |
| Environment | Symbol | Battle environment type | none |

### Weather Types
- `None` - Clear weather
- `Rain` - Light rain
- `HeavyRain` - Heavy rain
- `Storm` - Thunderstorm
- `Snow` - Light snow
- `Blizzard` - Heavy snow
- `Sandstorm` - Sandstorm
- `Sun` - Harsh sunlight
- `Fog` - Foggy weather

### Battle Environments
- `Grass` - Grassy field
- `TallGrass` - Tall grass
- `MovingWater` - River/ocean
- `StillWater` - Pond/lake
- `Cave` - Cave interior
- `Rock` - Rocky terrain
- `Sand` - Sandy/beach
- `Forest` - Forest
- `Snow` - Snowy field
- `Ice` - Icy terrain
- `Volcano` - Volcanic area
- `Graveyard` - Cemetery
- `Sky` - Sky battle
- `Space` - Space/dimension
- `UltraSpace` - Ultra Space

### Example Entry
```
[002]  # Lappet Town
Name = Lappet Town
Outdoor = true
ShowArea = true
MapPosition = 0,13,12
HealingSpot = 2,11,7
BattleBack = field

[047]  # Ice Cave
Name = Ice Cave
ShowArea = true
Bicycle = false
MapPosition = 0,10,8
Environment = Ice
BattleBack = cave
```

## map_connections.txt - Map Connections

### File Format
```
# Map 1 ID, Map 2 ID, Direction from Map 1, Offset
4,5,"South",0
5,4,"North",0
```

### Parameters
- **Map 1 ID**: Source map ID
- **Map 2 ID**: Destination map ID
- **Direction**: North, South, East, West
- **Offset**: Position offset (positive or negative)

### Example
```
# Route 1 connects to Viridian City
1,2,"North",0
2,1,"South",0

# Route 2 connects to Viridian Forest
2,3,"North",4
3,2,"South",-4
```

## town_map.txt - Town Map Configuration

### File Format
```
[Region]
Name = RegionName
Filename = graphic_filename
[MapID]
Name = LocationName
Point = X,Y,FlyDestinationX,FlyDestinationY
Flyable = true
```

### Example
```
[0]
Name = Kanto
Filename = townmap
[2]
Name = Pallet Town
Point = 13,12,11,7
Flyable = true
```

## types.txt - Type Effectiveness

### File Format
```
[TYPE]
Name = TypeName
IconPosition = X
Weaknesses = TYPE1,TYPE2,TYPE3
Resistances = TYPE1,TYPE2,TYPE3
Immunities = TYPE1,TYPE2
```

### Example
```
[FIRE]
Name = Fire
IconPosition = 1
Weaknesses = WATER,GROUND,ROCK
Resistances = FIRE,GRASS,ICE,BUG,STEEL,FAIRY
Immunities = 

[GHOST]
Name = Ghost
IconPosition = 7
Weaknesses = GHOST,DARK
Resistances = POISON,BUG
Immunities = NORMAL,FIGHTING
```

## abilities.txt - Pokemon Abilities

### File Format
```
[ABILITY_ID]
Name = AbilityName
Description = Ability description text.
```

### Example
```
[OVERGROW]
Name = Overgrow
Description = Powers up Grass-type moves when HP is low.

[STATIC]
Name = Static
Description = Contact may paralyze the attacker.

[INTIMIDATE]
Name = Intimidate
Description = Lowers the opposing Pokémon's Attack.
```

## berry_plants.txt - Berry Configuration

### File Format
```
[BERRYNAME]
Name = Berry Name
GrowthTime = Hours
MaxYield = Maximum berries
MinYield = Minimum berries
MoistureRate = Moisture loss rate
```

### Example
```
[CHERIBERRY]
Name = Cheri Berry
GrowthTime = 3
MaxYield = 5
MinYield = 2
MoistureRate = 15

[ORANBERRY]
Name = Oran Berry
GrowthTime = 4
MaxYield = 5
MinYield = 2
MoistureRate = 10
```

## shadow_pokemon.txt - Shadow Pokemon

### File Format
```
[SPECIES]
ShadowMoves = MOVE1,MOVE2,MOVE3,MOVE4
HeartGauge = Value
```

### Properties
- **ShadowMoves**: Shadow-exclusive moves
- **HeartGauge**: Purification requirement (higher = longer)

### Example
```
[TEDDIURSA]
ShadowMoves = SHADOWBOLT,SHADOWBLAST,SHADOWBREAK,SHADOWEND
HeartGauge = 3000

[VOLTORB]
ShadowMoves = SHADOWBOLT,SHADOWWAVE
HeartGauge = 2000
```

## regional_dexes.txt - Regional Pokedex

### File Format
```
[DexNumber]
Species1,Species2,Species3...
```

### Example
```
[0]  # National Dex (all Pokemon)

[1]  # Kanto Dex
BULBASAUR,IVYSAUR,VENUSAUR,CHARMANDER,CHARMELEON,CHARIZARD,
SQUIRTLE,WARTORTLE,BLASTOISE,CATERPIE,METAPOD,BUTTERFREE

[2]  # Johto Dex
CHIKORITA,BAYLEEF,MEGANIUM,CYNDAQUIL,QUILAVA,TYPHLOSION
```

## Parsing Guidelines

### General Rules
1. **Comments**: Lines starting with `#` are ignored
2. **Section Headers**: New sections marked with `[ID]`
3. **Continuation**: Long lines can continue with commas
4. **Whitespace**: Trim leading/trailing spaces
5. **Case Sensitivity**: Most IDs are case-sensitive
6. **Empty Lines**: Ignored
7. **Indentation**: Cosmetic (for sub-properties)

### Data Type Conventions
- **Integer**: Whole numbers (0, 5, 100)
- **Float**: Decimal numbers (0.5, 1.2)
- **String**: Text values
- **Boolean**: true/false
- **Symbol**: UPPERCASE_ID
- **Array**: Comma-separated values
- **Range**: min,max format

### Error Handling
1. Validate required fields
2. Check value ranges
3. Verify cross-references
4. Handle missing optional fields
5. Report duplicate IDs
6. Provide clear error messages

### Best Practices
1. Parse all PBS files before validation
2. Build index of all IDs for cross-reference
3. Support multiple file versions
4. Preserve comments when saving
5. Maintain original formatting
6. Cache parsed data
7. Implement progressive loading
8. Handle malformed data gracefully