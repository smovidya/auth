import { Hono } from 'hono'
import { jsxRenderer, useRequestContext } from 'hono/jsx-renderer';
import privacyPolicyHtml from './privacy-policy.html';
import { LoginPage } from './login';

const pageRouter = new Hono<{ Bindings: Env; }>()

pageRouter.get("*", jsxRenderer())
pageRouter.get("/login", (c) => {
  return c.render(<LoginPage />)
})

pageRouter.get("/privacy-policy", (c) => {
  return c.html(privacyPolicyHtml)
})


export { pageRouter }
