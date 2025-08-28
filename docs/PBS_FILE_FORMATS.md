# PBS File Formats Documentation

This document contains comprehensive documentation for Pokemon Essentials PBS (Pokémon Battle System) file formats, scraped from essentialsdocs.fandom.com

## Table of Contents
1. [Overview](#overview)
2. [General Format Rules](#general-format-rules)
3. [pokemon.txt - Species Definition](#pokemontxt---species-definition)
4. [items.txt - Item Definition](#itemstxt---item-definition)
5. [moves.txt - Move Definition](#movestxt---move-definition)
6. [trainers.txt - Individual Trainers](#trainerstxt---individual-trainers)
7. [trainer_types.txt - Trainer Types](#trainer_typestxt---trainer-types)
8. [Additional PBS Files](#additional-pbs-files)

## Overview

PBS files are text-based configuration files used by Pokémon Essentials to define game data. They are:
- Stored in the "PBS" folder
- Human-readable raw text files
- Directly editable
- Converted to game-usable data by the Compiler
- The compiled versions are stored in the "Data" folder

## General Format Rules

1. Each entry starts with an ID in square brackets: `[IDENTIFIER]`
2. Properties are defined as: `PropertyName = Value`
3. Order of properties doesn't matter (except the ID line must be first)
4. Comments can be added with `#`
5. Blank lines are ignored
6. Multiple files can be used with naming pattern: `filename_XYZ.txt`

## pokemon.txt - Species Definition

### File Format
```
[SPECIES_ID]
Property = Value
Property2 = Value2
```

### Required Fields
- Species ID (in square brackets)
- Name (recommended)
- Types (recommended)

### Key Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| Name | String | Display name | `Name = Bulbasaur` |
| Types | List | One or two elemental types | `Types = GRASS,POISON` |
| BaseStats | List | HP, Attack, Defense, Speed, Sp.Atk, Sp.Def | `BaseStats = 45,49,49,45,65,65` |
| GenderRatio | String | Gender distribution | `GenderRatio = Female50` |
| GrowthRate | String | Experience growth curve | `GrowthRate = MediumSlow` |
| BaseExp | Integer | Base experience yield | `BaseExp = 64` |
| EVs | List | Effort values given | `EVs = SPATK,1` |
| CatchRate | Integer | Catch difficulty (0-255) | `CatchRate = 45` |
| Happiness | Integer | Base happiness | `Happiness = 50` |
| Abilities | List | Regular abilities | `Abilities = OVERGROW,CHLOROPHYLL` |
| HiddenAbilities | List | Hidden abilities | `HiddenAbilities = CHLOROPHYLL` |
| Moves | List | Level-up moves | `Moves = 1,TACKLE,3,GROWL,7,VINEWHIP` |
| EggMoves | List | Egg moves | `EggMoves = AMNESIA,CHARM,CURSE` |
| TutorMoves | List | Tutor moves | `TutorMoves = BIND,BULLETSEED` |
| EggGroups | List | Breeding groups | `EggGroups = Monster,Grass` |
| HatchSteps | Integer | Steps to hatch | `HatchSteps = 5120` |
| Height | Float | Height in meters | `Height = 0.7` |
| Weight | Float | Weight in kg | `Weight = 6.9` |
| Color | String | Pokédex color | `Color = Green` |
| Shape | String | Body shape | `Shape = Quadruped` |
| Habitat | String | Natural habitat | `Habitat = Grassland` |
| Category | String | Species category | `Category = Seed Pokémon` |
| Pokedex | String | Pokédex entry | `Pokedex = Bulbasaur can be seen...` |
| FormName | String | Form name | `FormName = Alolan Form` |
| Evolutions | List | Evolution data | `Evolutions = IVYSAUR,Level,16` |

### Evolution Methods
Format: `Species,Method,Parameter`

Common methods:
- `Level,16` - Evolve at level 16
- `Item,FIRESTONE` - Use item
- `Trade` - Trade evolution
- `Happiness` - High happiness
- `HappinessDay` - High happiness during day
- `HappinessNight` - High happiness at night
- `HasMove,ANCIENTPOWER` - Knows specific move
- `Location,50` - At specific map
- `Beauty,170` - High beauty stat

### Example Entry
```
[BULBASAUR]
Name = Bulbasaur
Types = GRASS,POISON
BaseStats = 45,49,49,45,65,65
GenderRatio = Female12.5
GrowthRate = MediumSlow
BaseExp = 64
EVs = SPATK,1
CatchRate = 45
Happiness = 50
Abilities = OVERGROW
HiddenAbilities = CHLOROPHYLL
Moves = 1,TACKLE,1,GROWL,3,VINEWHIP,7,POISONPOWDER,9,SLEEPPOWDER
EggMoves = AMNESIA,CHARM,CURSE,ENDURE,GIGADRAIN
TutorMoves = BIND,BULLETSEED,GRASSKNOT
EggGroups = Monster,Grass
HatchSteps = 5120
Height = 0.7
Weight = 6.9
Color = Green
Shape = Quadruped
Habitat = Grassland
Category = Seed Pokémon
Pokedex = Bulbasaur can be seen napping in bright sunlight.
Evolutions = IVYSAUR,Level,16
```

## items.txt - Item Definition

### File Format
```
[ITEM_ID]
Property = Value
```

### Required Properties
- Item ID (in square brackets)
- Name

### Key Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| Name | String | Display name | `Name = Potion` |
| NamePlural | String | Plural form | `NamePlural = Potions` |
| PortionName | String | Portion name | `PortionName = Potion` |
| Pocket | Integer | Bag pocket (1-8) | `Pocket = 2` |
| Price | Integer | Buy price | `Price = 200` |
| SellPrice | Integer | Sell price (default: Price/2) | `SellPrice = 100` |
| Description | String | Item description | `Description = Restores 20 HP.` |
| FieldUse | String | Out-of-battle use | `FieldUse = OnPokemon` |
| BattleUse | String | In-battle use | `BattleUse = OnPokemon` |
| Consumable | Boolean | Is consumed on use | `Consumable = true` |
| ShowQuantity | Boolean | Show quantity in bag | `ShowQuantity = true` |
| Move | String | For TMs/HMs | `Move = FLAMETHROWER` |

### Bag Pockets
1. Items (General items)
2. Medicine (Healing items)
3. Poké Balls
4. TMs & HMs
5. Berries
6. Mail
7. Battle Items
8. Key Items

### Field Use Types
- `OnPokemon` - Use on a Pokémon
- `FromBag` - Use directly from bag
- `Direct` - Use immediately
- `Reusable` - Can be used multiple times
- `OnPokemonReusable` - Use on Pokémon, not consumed

### Battle Use Types
- `OnPokemon` - Use on your Pokémon
- `OnFoe` - Use on opposing Pokémon
- `OnBattler` - Use on any battler
- `PokeBall` - Catching Pokémon
- `NoUse` - Cannot be used in battle

### Special Flags
- `KeyItem` - Important items that can't be tossed
- `Mail` - Can hold messages
- `PokeBall` - Used for catching
- `Berry` - Berry items
- `EvolutionStone` - Evolution items
- `Fossil` - Fossil items
- `Apricorn` - Apricorn items
- `TypeGem` - Type-boosting gems
- `MegaStone` - Mega Evolution stones
- `ZCrystal` - Z-Crystals

### Example Entries
```
[POTION]
Name = Potion
NamePlural = Potions
Pocket = 2
Price = 200
FieldUse = OnPokemon
BattleUse = OnPokemon
Consumable = true
Description = Restores 20 HP to a Pokémon.

[POKEBALL]
Name = Poké Ball
NamePlural = Poké Balls
Pocket = 3
Price = 200
BattleUse = PokeBall
Description = A basic Ball used to catch wild Pokémon.
Flags = PokeBall

[BICYCLE]
Name = Bicycle
Pocket = 8
Price = 0
FieldUse = Direct
Description = Allows you to travel faster.
Flags = KeyItem

[TM01]
Name = TM01
NamePlural = TM01s
Pocket = 4
Price = 3000
Move = FOCUSPUNCH
Description = The user focuses, then punches.
```

## moves.txt - Move Definition

### File Format
```
[MOVE_ID]
Property = Value
```

### Required Properties
- Move ID (in square brackets)
- Name
- Type
- Category

### Key Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| Name | String | Display name | `Name = Flamethrower` |
| Type | String | Elemental type | `Type = FIRE` |
| Category | String | Physical/Special/Status | `Category = Special` |
| Power | Integer | Base damage | `Power = 90` |
| Accuracy | Integer | Hit chance (0-100) | `Accuracy = 100` |
| TotalPP | Integer | Maximum PP | `TotalPP = 15` |
| Target | String | Target selection | `Target = NearOther` |
| Priority | Integer | Move priority (-6 to 6) | `Priority = 0` |
| FunctionCode | String | Special effect code | `FunctionCode = BurnTarget` |
| Flags | List | Move properties | `Flags = CanProtect,CanMirrorMove` |
| EffectChance | Integer | Effect proc chance | `EffectChance = 10` |
| Description | String | Move description | `Description = Scorches the foe with intense fire.` |

### Categories
- `Physical` - Uses Attack stat
- `Special` - Uses Sp.Attack stat
- `Status` - Non-damaging move

### Common Target Types
- `None` - No target
- `User` - The user
- `NearAlly` - Adjacent ally
- `AllNearFoes` - All adjacent foes
- `RandomNearFoe` - Random adjacent foe
- `AllNearOthers` - All adjacent Pokémon
- `NearOther` - Single adjacent target
- `AllBattlers` - All Pokémon in battle
- `UserSide` - User's side
- `FoeSide` - Opponent's side
- `BothSides` - Both sides

### Common Flags
- `Contact` - Makes physical contact
- `CanProtect` - Can be blocked by Protect
- `CanMirrorMove` - Can be copied by Mirror Move
- `Punching` - Punching move
- `Biting` - Biting move
- `Pulse` - Pulse move
- `Bomb` - Bomb/ball move
- `Sound` - Sound-based move
- `Powder` - Powder move
- `Dance` - Dance move
- `ThawsUser` - Thaws frozen user

### Example Entries
```
[FLAMETHROWER]
Name = Flamethrower
Type = FIRE
Category = Special
Power = 90
Accuracy = 100
TotalPP = 15
Target = NearOther
FunctionCode = BurnTarget
EffectChance = 10
Flags = CanProtect,CanMirrorMove
Description = The target is scorched with intense fire. May burn.

[SWORDSDANCE]
Name = Swords Dance
Type = NORMAL
Category = Status
Power = 0
Accuracy = 0
TotalPP = 20
Target = User
FunctionCode = RaiseUserAtk2
Flags = Dance
Description = A frenetic dance to uplift the fighting spirit.

[TACKLE]
Name = Tackle
Type = NORMAL
Category = Physical
Power = 40
Accuracy = 100
TotalPP = 35
Target = NearOther
Flags = Contact,CanProtect
Description = A physical attack in which the user charges.
```

## trainers.txt - Individual Trainers

### File Format
```
[TrainerType,TrainerName,Version]
Property = Value
Pokemon = SPECIES,Level
    PokemonProperty = Value
```

### Trainer Header Format
- `[TrainerType,TrainerName]` - Basic trainer
- `[TrainerType,TrainerName,1]` - Versioned trainer (for rematches)

### Trainer Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| Items | List | Battle items | `Items = FULLRESTORE,HYPERPOTION` |
| LoseText | String | Defeat message | `LoseText = You're strong!` |

### Pokemon Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| Pokemon | String,Int | Species and level | `Pokemon = PIKACHU,25` |
| Name | String | Nickname | `Name = Sparky` |
| Form | Integer | Form number | `Form = 1` |
| Gender | String | M/F | `Gender = M` |
| Shiny | Boolean | Is shiny | `Shiny = true` |
| SuperShiny | Boolean | Is super shiny | `SuperShiny = true` |
| ShadowPokemon | Boolean | Is shadow | `ShadowPokemon = true` |
| Moves | List | Move set | `Moves = THUNDERBOLT,QUICKATTACK,IRONTAIL,THUNDER` |
| Ability | String/Int | Ability name or index | `Ability = STATIC` or `AbilityIndex = 0` |
| Item | String | Held item | `Item = LIGHTBALL` |
| Nature | String | Nature | `Nature = ADAMANT` |
| IV | Int/List | Individual values | `IV = 31` or `IV = 31,31,31,31,31,31` |
| EV | List | Effort values | `EV = 0,252,0,0,0,252` |
| Happiness | Integer | Happiness value | `Happiness = 255` |
| Ball | String | Pokéball type | `Ball = ULTRABALL` |

### Example Entries
```
[YOUNGSTER,Ben]
LoseText = Aww, I lost.
Pokemon = RATTATA,10
Pokemon = EKANS,11

[LEADER_Brock,Brock]
Items = FULLRESTORE,FULLRESTORE
LoseText = Very good.
Pokemon = GEODUDE,12
    Moves = DEFENSECURL,HEADSMASH,ROCKPOLISH,ROCKTHROW
    AbilityIndex = 0
    IV = 20,20,20,20,20,20
Pokemon = ONIX,14
    Name = Rocky
    Gender = M
    Moves = BIND,ROCKTHROW,RAGE,ROCKTOMB
    Ability = STURDY
    Item = SITRUSBERRY
    IV = 20,20,20,20,20,20
    Ball = GREATBALL

[CHAMPION,Lance,1]
Items = FULLRESTORE,FULLRESTORE,FULLRESTORE,FULLRESTORE
LoseText = I still can't believe it...
Pokemon = DRAGONITE,75
    Moves = FIREBLAST,SAFEGUARD,OUTRAGE,HYPERBEAM
    AbilityIndex = 0
    IV = 30,30,30,30,30,30
```

## trainer_types.txt - Trainer Types

### File Format
```
[TRAINERTYPE_ID]
Property = Value
```

### Required Properties
- Trainer type ID (in square brackets)
- Name

### Key Properties

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| Name | String | Display name | `Name = Gym Leader` |
| Gender | String | Male/Female/Unknown | `Gender = Male` |
| BaseMoney | Integer | Base money multiplier | `BaseMoney = 100` |
| SkillLevel | Integer | AI difficulty (0-400) | `SkillLevel = 100` |
| Flags | List | Special behaviors | `Flags = DoubleBattle` |
| IntroBGM | String | Intro music | `IntroBGM = Battle Elite` |
| BattleBGM | String | Battle music | `BattleBGM = Battle Gym Leader` |
| VictoryBGM | String | Victory music | `VictoryBGM = Battle victory leader` |

### Skill Levels
- 0-31: Low skill (random moves)
- 32-47: Some skill (avoids bad moves)
- 48-99: Medium skill (uses type effectiveness)
- 100-139: High skill (advanced strategies)
- 140+: Maximum skill (perfect play)

### Required Graphics Files
- Overworld: `Graphics/Characters/trainer_TYPENAME.png`
- Battle sprite: `Graphics/Trainers/TYPENAME.png`
- Back sprite: `Graphics/Trainers/TYPENAME_back.png`

### Example Entries
```
[YOUNGSTER]
Name = Youngster
Gender = Male
BaseMoney = 16
SkillLevel = 32

[LEADER_Brock]
Name = Gym Leader
Gender = Male
BaseMoney = 100
SkillLevel = 100
IntroBGM = Battle Elite
BattleBGM = Battle Gym Leader
VictoryBGM = Battle victory leader

[CHAMPION]
Name = Champion
Gender = Unknown
BaseMoney = 200
SkillLevel = 150
Flags = StrongTrainer
BattleBGM = Battle Champion
```

## Additional PBS Files

### pokemon_forms.txt
Defines alternate forms for Pokémon species. Format similar to pokemon.txt but references base species.

```
[PIKACHU,1]
FormName = Surfing Pikachu
Moves = 1,SURF,1,TACKLE,1,GROWL
```

### encounters.txt
Defines wild Pokémon encounters for maps.

```
[001] # Map ID
Land = 21 # Encounter rate
    PIDGEY,2,5,50 # Species, min level, max level, weight
    RATTATA,2,5,50
Water = 2
    MAGIKARP,5,10,100
```

### map_metadata.txt
Defines map properties.

```
[001]
Name = Route 1
Outdoor = true
ShowArea = true
Bicycle = true
```

### abilities.txt
Defines Pokémon abilities.

```
[OVERGROW]
Name = Overgrow
Description = Powers up Grass-type moves when HP is low.
```

### types.txt
Defines elemental types and effectiveness.

```
[FIRE]
Name = Fire
IconPosition = 0
Weaknesses = WATER,GROUND,ROCK
Resistances = FIRE,GRASS,ICE,BUG,STEEL,FAIRY
```

### berry_plants.txt
Defines berry growth mechanics.

```
[CHERIBERRY]
Name = Cheri Berry
GrowthTime = 3
MaxYield = 5
MinYield = 2
```

### regional_dexes.txt
Defines regional Pokédex configurations.

```
[0] # National Dex
[1] # Regional Dex 1
BULBASAUR,IVYSAUR,VENUSAUR
```

### shadow_pokemon.txt
Defines Shadow Pokémon and their purification.

```
[TEDDIURSA]
ShadowMoves = SHADOWBOLT,SHADOWBLAST,SHADOWBREAK,SHADOWEND
GaugeSize = 3000
```

### Battle Facility Files
Various files for Battle Tower/Frontier:
- `battle_facility_lists.txt` - Banned Pokémon/items
- `battle_tower_pokemon.txt` - Rental Pokémon
- `battle_tower_trainers.txt` - Tower trainers
- Cup files (`cup_xxx_pkmn.txt`, `cup_xxx_trainers.txt`)

## Parsing Considerations

1. **Line-based parsing**: Files are parsed line by line
2. **Section headers**: New sections start with `[ID]`
3. **Property format**: `PropertyName = Value`
4. **Comments**: Lines starting with `#` are ignored
5. **Whitespace**: Leading/trailing whitespace should be trimmed
6. **Case sensitivity**: IDs are typically uppercase
7. **Lists/Arrays**: Usually comma-separated
8. **Nested properties**: Indented lines belong to previous non-indented line
9. **Multiple files**: Can split data across multiple files with pattern `name_XYZ.txt`
10. **Version differences**: Some properties may vary between Essentials versions

## Data Types

- **String**: Text values, may need quotes if contains special characters
- **Integer**: Whole numbers
- **Float**: Decimal numbers
- **Boolean**: true/false
- **List**: Comma-separated values
- **Symbol**: Uppercase identifiers (e.g., FIRE, TACKLE)
- **Range**: min,max format

## Best Practices

1. Always validate data after parsing
2. Handle missing optional properties gracefully
3. Use appropriate defaults for missing values
4. Preserve comments when possible
5. Maintain original formatting when saving
6. Check for duplicate IDs
7. Validate cross-references between files
8. Support multiple file sources
9. Handle version differences gracefully
10. Provide clear error messages for invalid data