import express from "express";
import { getHandler } from "./database";
import type { DBHandler } from "./database";
import { PostBody, PutBody, DeleteBody, GetParams } from "./types";
import { asyncHandler, errorHandler, notFound, validateRequestAsync } from "./middleware";

const app = express()
app.use(express.json())

const port = 8080;

app.get('/isAlive', (_, res) => {
  res.json({'isAlive': true});
})

app.post('/users', asyncHandler(validateRequestAsync({body: PostBody})), asyncHandler(async (req, res) => {
  res.json(await databaseHandler.create(req.body.name));
}))

app.get("/users/:id", asyncHandler(validateRequestAsync({params: GetParams})), asyncHandler(async (req, res) => {
  res.json(await databaseHandler.read(req.params.id));
}))
app.get("/users", asyncHandler(async (_, res) => {
  res.json(await databaseHandler.read());
}))

app.put("/users", asyncHandler(validateRequestAsync({body: PutBody})), asyncHandler(async(req, res) => {
  res.json(
    await databaseHandler.update(
      req.body.id, req.body.new_name
    )
  )
}))

app.delete("/users", asyncHandler(validateRequestAsync({body: DeleteBody})), asyncHandler(async (req, res) => {
  res.json(await databaseHandler.delete(req.body.id));
}))

app.use(notFound)
app.use(errorHandler)

let databaseHandler: DBHandler;

app.listen(
  port,
  async () => {
    databaseHandler = await getHandler();
    await databaseHandler.createBase();
    console.log(`Server is running on ${port}`);
  }
)