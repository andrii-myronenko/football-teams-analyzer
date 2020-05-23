import "reflect-metadata";
import { createConnection } from "typeorm";
import Koa from 'koa';
import { FootballGame } from "./models/game"
import bodyParser from "koa-bodyparser";
import { config } from "./config";
import { router as footballRouter } from "./routes/football";
import cors from '@koa/cors';

const bootstrap = async () => {
    try{
        await createConnection({
            type: "mongodb",
            url: config.MongoUri,
            entities: [FootballGame]
        });

        console.log("MongoDB is running");

        await FootballGame.fillFromCsvIfEmpty() 
            ? console.log("Database is filled with football games data")
            : console.log("Football games data is already present in the db");

        const app = new Koa();

        app.use(bodyParser());
        app.use(cors());

        app.use(footballRouter.routes());

        app.listen(config.ServerPort, () => console.log(`🚀 Server ready on port ${config.ServerPort}`));
    }
    catch(e){
        console.log(e.message);
    }
};

bootstrap();