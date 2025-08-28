import { type RouteConfig, index, route, prefix } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  
  // Pokémon routes
  route("pokemon", "routes/pokemon.tsx", [
    index("routes/pokemon._index.tsx"),
    route(":id", "routes/pokemon.$id.tsx"),
  ]),
  
  // Trainer routes
  route("trainers", "routes/trainers.tsx", [
    index("routes/trainers._index.tsx"),
    route(":id", "routes/trainers.$id.tsx"),
  ]),
  
  // Move routes
  route("moves", "routes/moves.tsx", [
    index("routes/moves._index.tsx"),
    route(":id", "routes/moves.$id.tsx"),
  ]),
  
  // Item routes
  route("items", "routes/items.tsx", [
    index("routes/items._index.tsx"),
    route(":id", "routes/items.$id.tsx"),
  ]),
  
  // Encounter routes
  route("encounters", "routes/encounters.tsx", [
    index("routes/encounters._index.tsx"),
  ]),
  
  // Single page routes
  route("compare", "routes/compare.tsx"),
] satisfies RouteConfig;
