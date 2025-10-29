import { Router, Request, Response } from 'express'
import RegisterModel from '../model/RegisterModel'
import RegisterView from '../view/RegisterView'

export default class RegisterRouter {
  public readonly router: Router
  private readonly model: RegisterModel
  private readonly view: RegisterView

  constructor(view: RegisterView) {
    this.router = Router()
    this.model = new RegisterModel()
    this.view = view
    this.routes()
  }
  private readonly routes = (): void => {

    this.router.get("/", (_req: Request, res: Response) => {
      this.view.renderAddForm(res)
    })

    this.router.post("/", (req: Request, res: Response) => {
      const { title, summary, content, image, date, comments } = req.body

      if (!title || !summary || !content || !date) {
        return res.status(400).send("Todos los campos obligatorios deben completarse.")
      }

      this.model.saveNews({ title, summary, content, image, date, comments })
      return this.view.redirectToNews(res)
    })
  }
}