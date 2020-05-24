import { Entity, ObjectID, ObjectIdColumn, Column, BaseEntity } from "typeorm";
import { getFootballData } from "../modules/parser";
import {getMongoManager} from "typeorm";


@Entity()
export class FootballGame extends BaseEntity {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    public homeOrAway: string;

    @Column()
    public expectedGoals: number;

    @Column()
    public expectedGoalsOpposite: number;

    @Column()
    public scoredGoals: number;

    @Column()
    public missedGoals: number;

    @Column()
    public wins: number;

    @Column()
    public draws: number;

    @Column()
    public loses: number;

    @Column()
    public pts: number;

    @Column()
    public expectedPts: number;

    @Column()
    public pressingRate: number;

    @Column()
    public teamId: string;

    @Column()
    public matchDay: string;

    constructor(footballGame: Partial<FootballGame>) {
        super();

        Object.assign(this, footballGame);
    }

    private static async isEmpty() {
        return !(await FootballGame.find({})).length;
    }

    public static async fillFromCsv() {
        return FootballGame.save(await getFootballData());
    }

    public static async fillFromCsvIfEmpty() {
        const isDatabaseEmpty = await FootballGame.isEmpty();
        return isDatabaseEmpty ? FootballGame.fillFromCsv() : false;
    }

    public static async getTeamsInformation() {
        const manager = getMongoManager(); 
        return await manager.aggregate(FootballGame, [
            {
                $group: {
                    _id: { teamId: "$teamId" },
                    pts: { $sum: "$pts" },
                    wins: { $sum: "$wins" },
                    draws: { $sum: "$draws" },
                    loses: { $sum: "$loses" },
                    scoredGoals: { $sum: "$scoredGoals" },
                    misedGoals: { $sum: "$missedGoals" },
                },
            },
            {
                $sort: { pts: -1 },
            }
        ]).toArray();
    }

    public static async getTeamsPtsAndExpectedPts() {
        const manager = getMongoManager(); 
        return await manager.aggregate(FootballGame, [
            {
                $group: {
                    _id: { teamId: "$teamId" },
                    pts: { $sum: "$pts" },
                    expectedPts: { $sum: "$expectedPts" },
                },
            }
        ]).toArray();
    }

    public static async getGamesPtsScoredPair() {
        const manager = getMongoManager(); 
        return await manager.aggregate(FootballGame, [
            {
                $project: {
                    pts: 1,
                    scoredGoals: 1,
                },
            }
        ]).toArray();
    }


    public static async getTeamsPtsExpectedPair() {
        const manager = getMongoManager(); 
        return await manager.aggregate(FootballGame, [
            {
                $group: {
                    _id: { teamId: "$teamId" },
                    pts: { $sum: "$pts" },
                    expectedPts: { $sum: "$expectedPts" }
                },
            }
        ]).toArray();
    }

    public static async getTeamsGoalsExpectedGoalsPair() {
        const manager = getMongoManager(); 
        return await manager.aggregate(FootballGame, [
            {
                $group: {
                    _id: { teamId: "$teamId" },
                    expectedGoals: { $sum: "$expectedGoals" },
                    scoredGoals: { $sum: "$scoredGoals" }
                },
            }
        ]).toArray();
    }

}
