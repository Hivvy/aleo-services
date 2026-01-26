import server from "@/config/server";
import aleo from "@/routes/aleo";

server.app.use('/aleo', aleo);

server.start();
