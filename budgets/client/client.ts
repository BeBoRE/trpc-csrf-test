import { RouterOutputs } from "../../budgets/server/router";
import { api } from "./trpc";

const renderUser = (user: RouterOutputs["user"]["user"] | null) => {
  const userElement = document.querySelector("p#user");

  if (!(userElement instanceof HTMLParagraphElement)) {
    throw new Error("User element not found");
  }

  if (!user) {
    userElement.textContent = "Not logged in";
    return;
  }

  userElement.textContent = `${user.username} - ${user.value}`;
};

const renderUsers = (users: RouterOutputs["allUsers"]["users"]) => {
  const usersElement = document.querySelector("main");

  if (!(usersElement instanceof HTMLElement)) {
    throw new Error("Users element not found");
  }

  if (users.length === 0) {
    usersElement.textContent = "No users found";
    return;
  }

  const ul = document.createElement("ul");
  usersElement.appendChild(ul);

  for (const user of users) {
    const li = document.createElement("li");
    li.textContent = `${user.username} - ${user.value}`;
    ul.appendChild(li);
  }

  usersElement.replaceChildren(ul);
};

const getAllUsers = async () => {
  const { users } = await api.allUsers.query();
  renderUsers(users);
};

const loggedInCheck = () => {
  const userElement = document.querySelector("p#user");

  if (!(userElement instanceof HTMLParagraphElement)) {
    throw new Error("User element not found");
  }

  api.user
    .query()
    .then(({ user }) => {
      renderUser(user);
    })
    .then(() => {
      getAllUsers();
    })
    .catch((err) => {
      console.error(err);

      renderUser(null);
    });
};

loggedInCheck();

const loginForm = document.querySelector("form#login");

if (!(loginForm instanceof HTMLFormElement)) {
  throw new Error("Form not found");
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(loginForm);
  const username = formData.get("username");

  if (typeof username !== "string") {
    throw new Error("Username not found");
  }

  await api.login.query({ username });
  loggedInCheck();
});

const giveValueForm = document.querySelector("form#give-value");
const errorElement = document.querySelector("form#give-value p#error");

if (!(giveValueForm instanceof HTMLFormElement)) {
  throw new Error("Form not found");
}

giveValueForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(giveValueForm);
  const username = formData.get("username");
  const value = formData.get("value");

  if (typeof username !== "string" || typeof value !== "string") {
    console.log(username, value);
    console.log(typeof username, typeof value);

    throw new Error("Username or value not found");
  }

  await api.giveValue
    .mutate({ username, value: parseInt(value, 10) })
    .catch((err) => {
      if (err instanceof Error && errorElement) {
        errorElement.textContent = err.message;
      }
    });
  loggedInCheck();
});
