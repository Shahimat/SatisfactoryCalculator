import fastify from 'fastify';

const server = fastify();

server.get('/ping', async (request, reply) => {
  const data = await fetch('https://satisfactory-calculator.com/ru/items');
  const text = await data.text();
  reply.code(200).send(text);
  // reply
  //   .code(200)
  //   .header('Content-Type', 'application/json; charset=utf-8')
  //   .send({ pong: 'pong' });
});

server.listen({ host: 'localhost', port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
