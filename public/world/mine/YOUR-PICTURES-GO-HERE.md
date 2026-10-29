# Your own pictures

Put your own room paintings and your own map in this folder.
Then point a room at one in `coven.config.json` with `"painting": "mine/your-picture.jpg"`, or your map with `"art": { "map": "mine/your-map.jpg" }`.
File names use letters, numbers, dashes and underscores, ending in .jpg, .png or .webp.
Run `npm run build:world` and it checks every picture is here.
