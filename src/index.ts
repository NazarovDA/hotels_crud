import express from "express";
import { getHandler } from "./database";
import type { DBHandler } from "./database";
import { PostBody, GetBody, PutBody, DeleteBody } from "./types";
import { asyncHandler, errorHandler, notFound, validateRequestAsync } from "./middleware";

const app = express()
app.use(express.json())

const port = 8080;

app.get('/isAlive', (req, res) => {
  res.json({'isAlive': true});
})

app.post('/users', asyncHandler(validateRequestAsync({body: PostBody})), asyncHandler(async (req, res) => {
  res.json(await databaseHandler.create(req.body.name));
}))

app.get("/users", asyncHandler(validateRequestAsync({body: GetBody})), asyncHandler(async (req, res) => {
  res.json(await databaseHandler.read(req.body.id));
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