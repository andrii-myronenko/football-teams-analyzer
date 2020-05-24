import Router from 'koa-router';
import { FootballGame } from "../models/football-game";
import { sampleCorrelation, linearRegression } from 'simple-statistics';
import child_process from 'child_process'
import path from 'path'

export const router = new Router({
  prefix: '/api/football'
})
.get('/teams', async (ctx) => {
    ctx.body = await FootballGame.getTeamsInformation();
})
.get('/goalsPtsRegressionCorrelation', async (ctx) => {
    const dbQueryResult = await FootballGame.getGamesPtsScoredPair();
    const ptsScoredArrays = dbQueryResult.reduce((acc, value) => {
        acc.scored.push(value.scoredGoals);
        acc.pts.push(value.pts);
        acc.pair.push([value.scoredGoals, value.pts]);
        return acc;
    }, { pts: [], scored: [], pair: [] })

    const correlation = ptsScoredArrays.scored.length ? sampleCorrelation(ptsScoredArrays.scored, ptsScoredArrays.pts) : 0;
    const { m, b } = linearRegression(ptsScoredArrays.pair);
    ctx.body =  {
        regresion: { m, b },
        ptsScoredParis: ptsScoredArrays.pair,
        correlation 
    }
})
.get('/getTopAndLeastPerformingTeams', async (ctx) => {
    const dbQueryResult = await FootballGame.getTeamsPtsExpectedPair();

    const teamPerformancePairs = dbQueryResult.map((value) => {
        const performance = value.pts / value.expectedPts;
        return [value._id.teamId, performance];
    })

    const sortedPerformanceTeamPairs = teamPerformancePairs.sort((a, b) => b[1] - a[1]);
    const topPerformerTeams = sortedPerformanceTeamPairs.slice(0, 5);
    const leastPerformingTeams = sortedPerformanceTeamPairs.slice(Math.max(sortedPerformanceTeamPairs.length - 5, 0));
    ctx.body = {
        topPerformerTeams,
        leastPerformingTeams
    };
})
.get('/getTopAndLeastScoringTeams', async (ctx) => {
    const dbQueryResult = await FootballGame.getTeamsGoalsExpectedGoalsPair();

    const teamScoringPerformancePairs = dbQueryResult.map((value) => {
        const performance = value.scoredGoals / value.expectedGoals;
        return [value._id.teamId, performance];
    })

    const sortedScoringPerformanceTeamPairs = teamScoringPerformancePairs.sort((a, b) => b[1] - a[1]);
    const topScoringTeams = sortedScoringPerformanceTeamPairs.slice(0, 5);
    const leastScoringTeams = sortedScoringPerformanceTeamPairs.slice(Math.max(sortedScoringPerformanceTeamPairs.length - 5, 0));
    ctx.body = {
        topScoringTeams,
        leastScoringTeams
    };
})
.post('/db/backup', async (ctx) => {
    const pathToSave = path.join(__dirname, `../backup`);
    const command = `mongodump --host localhost --port 27017 --db mydb --out ${pathToSave} `;
    child_process.exec(command);
    ctx.status = 200;
})
.post('/db/restore', async (ctx) => {
    const pathToRestore = path.join(__dirname, `../backup`);
    const command = `mongorestore ${pathToRestore} `;
    child_process.exec(command);
    ctx.status = 200;
});