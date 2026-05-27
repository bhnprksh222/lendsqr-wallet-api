import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  // Keep startup log simple for managed runtimes.
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${env.port}`);
});
