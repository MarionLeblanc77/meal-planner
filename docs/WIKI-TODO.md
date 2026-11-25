# WIKI-TODO

## Fixes

- (1) Handle ingredients and categories names as lowercase trimed in back and style with uppercase in front

## Diverse Design / Features

- (2) Add Source of recipe
- (3) Instructions, temperature and mode, cooking time and total time, origin, comments (all recipe fields, info but picture)
- (4) Add Portions of ingredients (how to handle units ? conversion info)
- (5) Add user system
- Think about exclusion on the filters (at least ingredient)
- Last added, last seen and top used the past rolling 6 months on the meal planning page
- Equipement options in search
- Make CustomOnOffChip a CustomDesignFeature ?

## Translation

Common decision 26/09/17 :

- units : automatically converted & updated if change happen in one "language"
- database strings : translated at creation by a service (keep a way of identifying it visually for validation by user) and only modified by the user after that (no re-translation in the other language every time a string is updated by user in one language). Where to store ?
- non-database strings : translated by dev at creation. Where to store ?

## Database structure

- How to handle user data : 1 database per user or a join table ?

## AI importer

- Handle several images if recipe comes from a book that has it on several pages
