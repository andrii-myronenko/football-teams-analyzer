import fs from 'fs';
import Papa, { ParseResult } from 'papaparse';
import { FootballGame } from '../models/football-game';
import Joi from '@hapi/joi';

const CSVHeaderMap = {
    h_a: 'homeOrAway',
    xG: 'expectedGoals',
    xGA: 'expectedGoalsOpposite',
    scored: 'scoredGoals',
    missed: 'missedGoals',
    wins: 'wins',
    draws: 'draws',
    loses: 'loses',
    pts: 'pts',
    teamId: 'teamId',
    matchDay: 'matchDay',
    xpts: 'expectedPts',
    allowed_ppda: 'pressingRate'

};

const validationSchema = Joi.object({
    homeOrAway: Joi.string().required(),
    expectedGoals: Joi.number().required(),
    expectedGoalsOpposite: Joi.number().required(),
    scoredGoals: Joi.number().required(),
    missedGoals: Joi.number().required(),
    wins: Joi.number().required(),
    draws: Joi.number().required(),
    loses: Joi.number().required(),
    pts: Joi.number().required(),
    teamId: Joi.string().required(),
    matchDay: Joi.string().required(),
    expectedPts: Joi.number().required(),
    pressingRate: Joi.number().required(),
});

function parseData (file: string | File | NodeJS.ReadableStream) {
    return new Promise<ParseResult>(function (complete, error) {
        Papa.parse(file, { complete, error, header: true });
    });
};

export const getFootballData = async (): Promise<FootballGame[]> => {
    const stream = fs.createReadStream(process.cwd() + '/dataset/epl2020.csv');
    const { data } = await parseData(stream);
    const documents = data.map<FootballGame>(game => {
        const keys = Object.keys(game);
        const document = keys.reduce<any>((acc, gk) => {
            const value = game[gk];
            return CSVHeaderMap[gk] ? {...acc, [CSVHeaderMap[gk]]: value} : {...acc}
        }, {});

        const { error, value: validDocument } = validationSchema.validate(document);
        return error ? undefined : new FootballGame(validDocument);
    }).filter(document => !!document);

    return documents;
}