import vercelAppHandler from "./_vercelApp";

export const config = {
  runtime: "nodejs",
  maxDuration: 60,
  regions: ["iad1", "fra1", "sfo1"],
};

export default vercelAppHandler;
