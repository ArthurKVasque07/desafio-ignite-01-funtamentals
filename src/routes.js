import { randomUUID } from "node:crypto";

import { Database } from "./database.js";
import { buildRoutePath } from "./utils/build-route-path.js";

const database = new Database();

export const routes = [
  {
    method: "GET",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.query;

      const searchObj =
        title || description
          ? {
              title: title,
              description: description,
            }
          : null;

      const tasks = database.select("tasks", searchObj);

      return res.end(JSON.stringify(tasks));
    },
  },
  {
    method: "POST",
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { title, description } = req.body;

      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({
            message:
              "Para criar uma task o titulo e descrição devem ser informados.",
          })
        );
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const taskCreated = database.insert("tasks", task);

      return res.writeHead(201).end(JSON.stringify(taskCreated));
    },
  },
  {
    method: "DELETE",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end()
      }

      database.delete('tasks', id)

      return res.writeHead(204).end()
    },
  },
  {
    method: "PUT",
    path: buildRoutePath("/tasks/:id"),
    handler: (req, res) => {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title || !description) {
        return res.writeHead(400).end(
          JSON.stringify({ message: 'title or description are required' })
        )
      }

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end()
      }

      database.update('tasks', id, {
        title,
        description,
        updated_at: new Date()
      })

      return res.writeHead(204).end()
    },
  },
  {
    method: "PATCH",
    path: buildRoutePath("/tasks/:id/complete"),
    handler: (req, res) => {
      const { id } = req.params;

      const [task] = database.select('tasks', { id })

      if (!task) {
        return res.writeHead(404).end()
      }

      const isTaskCompleted = !!task.completed_at
      const completed_at = isTaskCompleted ? null : new Date()

      database.update('tasks', id, { completed_at })

      return res.writeHead(204).end()
    },
  },
];
