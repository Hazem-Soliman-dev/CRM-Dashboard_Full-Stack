import vercelAppHandler from "./_vercelApp";

export const config = {
  runtime: "nodejs",
  memory: 1536,
  maxDuration: 60,
};

export default vercelAppHandler;

