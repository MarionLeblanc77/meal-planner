# WIKI-TODO

## Fixes

- (4) deletion button on recipe doesn't work

## Translation

Common decision 26/09/17 :

- units : automatically converted & updated if change happen in one "language"
- database strings : translated at creation by a service (keep a way of identifying it visually for validation by user) and only modified by the user after that (no re-translation in the other language every time a string is updated by user in one language). Where to store ?
- non-database strings : translated by dev at creation. Where to store ?

## Database structure

- How to handle user data : 1 database per user or a join table ?

## Design / Features

- (3) Seasonality in search
- Portions of ingredients (how to handle units ? conversion info)
- Instructions, temperature and mode, cooking time and total time, origin, comments
- Think about exclusion on the filter (at least ingredient)
- Last added, last seen and top used the past rolling 6 months on the meal planning page
- Equipement options in search
