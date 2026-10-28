import express from "express";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
const swaggerDocument = JSON.parse(readFileSync(join(__dirname, "openapi.json"), "utf8"));

const app = express();
app.use(express.json());
const port = 3000;

const tasks = [
    { id: 1, title: "Buy groceries", done: false },
    { id: 2, title: "Finish project report", done: true },
    { id: 3, title: "Call the dentist", done: false },
];

app.get("/", (req, res) => {
    res.json({
        name: "Task API",
        version: "1.0.1",
        endpoints: ["/tasks"]
    });
});

app.get("/health", (req, res) => {

    res.json({ status: "ok" });
});

app.get("/tasks", (req, res) => {

    res.json({
        tasks
    });

});

app.post("/tasks", (req, res) => {

    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({ error: "Title is required" });
    }

    const nextId = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;

    const newTask = {
        id: nextId,
        title: title.trim(),
        done: false
    };

    tasks.push(newTask);

    res.status(201).json({
        task: newTask
    });
});

app.get("/tasks/:id", (req, res) => {

    const taskId = Number(req.params.id);

    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
    }

    res.json({
        task
    });
});

app.put("/tasks/:id", (req, res) => {

    const taskId = Number(req.params.id);

    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
    }

    const { title, done } = req.body;

    if (title === undefined && done === undefined) {
        return res.status(400).json({ error: "Body must include title or done" });
    }

    if (title !== undefined) {
        if (!title || !title.trim()) {
            return res.status(400).json({ error: "Title cannot be empty" });
        }
        task.title = title.trim();
    }

    if (done !== undefined) {
        task.done = Boolean(done);
    }

    res.json({
        task
    });
});

app.delete("/tasks/:id", (req, res) => {

    const taskId = Number(req.params.id);

    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
        return res.status(404).json({ error: `Task ${taskId} not found` });
    }

    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    // rebind the module-level array so the closure sees the change
    tasks.length = 0;
    tasks.push(...updatedTasks);

    res.status(204).send();
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
