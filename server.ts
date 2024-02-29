import budgetServer from "./budgets/server";
import csrfServer from "./csrf/server";

console.log("Starting servers");
console.log(`http://localhost:3000`);
console.log(`http://localhost:3001`);

await Promise.all([
  await budgetServer.listen({
    port: 3000,
  }),
  await csrfServer.listen({
    port: 3001,
  }),
]);
