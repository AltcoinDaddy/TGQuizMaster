import { GameManager } from './GameManager';
import { Server } from 'socket.io';

/**
 * Singleton registry for all active game rooms.
 * Allows both the Express/Socket server and the Telegram Bot
 * to access and manage rooms without circular dependencies.
 */
class RoomRegistry {
    private static instance: RoomRegistry;
    private rooms: Map<string, GameManager> = new Map();
    private io?: Server;

    private constructor() { }

    public static getInstance(): RoomRegistry {
        if (!RoomRegistry.instance) {
            RoomRegistry.instance = new RoomRegistry();
        }
        return RoomRegistry.instance;
    }

    public setIO(io: Server) {
        this.io = io;
    }

    public getIO(): Server | undefined {
        return this.io;
    }

    public getRoom(roomId: string): GameManager | undefined {
        return this.rooms.get(roomId);
    }

    public getAllRooms(): GameManager[] {
        return Array.from(this.rooms.values());
    }

    public setRoom(roomId: string, manager: GameManager) {
        this.rooms.set(roomId, manager);
    }

    public deleteRoom(roomId: string) {
        this.rooms.delete(roomId);
    }

    public createRoom(
        roomId: string,
        type: 'stars' | 'chz' | 'free' | 'practice' = 'free',
        prize = 0,
        fee = 10,
        maxPlayers = 5,
        category = 'General'
    ): GameManager {
        if (!this.io) throw new Error('RoomRegistry: IO not initialized');

        const manager = new GameManager(roomId, this.io, type, prize, fee, maxPlayers, category);
        this.rooms.set(roomId, manager);
        return manager;
    }

    public get size(): number {
        return this.rooms.size;
    }
}

export const roomRegistry = RoomRegistry.getInstance();
