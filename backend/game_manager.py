
import random
import uuid

from questions import QUESTIONS


class GameManager:

    def __init__(self):
        self.rooms = {}
        self.waiting_players = []

    def add_player(self, player_id):
        self.waiting_players = [
            p for p in self.waiting_players
            if p != player_id
        ]

        self.waiting_players.append(player_id)

        if len(self.waiting_players) < 2:
            return None

        player1 = self.waiting_players.pop(0)
        player2 = self.waiting_players.pop(0)

        room_id = str(uuid.uuid4())[:8]

        self.rooms[room_id] = {
            "players": [player1, player2],
            "health": {
                player1: 100,
                player2: 100
            },
            "scores": {
                player1: 0,
                player2: 0
            },
            "status": "playing",
            "current_question": None,
            "answered_by": set(),
            "winner": None
        }

        self.next_question(room_id)

        return room_id

    def next_question(self, room_id):

        room = self.rooms[room_id]

        question = random.choice(QUESTIONS)

        room["current_question"] = question
        room["answered_by"] = set()

    def get_public_question(self, room_id):

        question = self.rooms[room_id]["current_question"]

        return {
            "id": question["id"],
            "question": question["question"]
        }

    def get_game_state(self, room_id):

        room = self.rooms[room_id]

        return {
            "room_id": room_id,
            "players": room["players"],
            "health": room["health"],
            "scores": room["scores"],
            "status": room["status"]
        }

    def submit_answer(self, room_id, player_id, answer):

        room = self.rooms.get(room_id)

        if not room or room["status"] != "playing":
            return {"status": "invalid_game"}

        if player_id not in room["players"]:
            return {"status": "unauthorized"}

        question = room["current_question"]

        if player_id in room["answered_by"]:
            return {"status": "already_answered"}

        room["answered_by"].add(player_id)

        if str(answer).strip() != question["answer"]:
            return {"status": "wrong"}

        opponent = next(
            p for p in room["players"]
            if p != player_id
        )

        room["scores"][player_id] += 10

        room["health"][opponent] = max(
            0,
            room["health"][opponent] - question["damage"]
        )

        if room["health"][opponent] <= 0:

            room["status"] = "finished"
            room["winner"] = player_id

            return {
                "status": "game_over",
                "winner": player_id
            }

        self.next_question(room_id)

        return {
            "status": "correct",
            "winner": None
        }

    def remove_player(self, player_id):

        self.waiting_players = [
            p for p in self.waiting_players
            if p != player_id
        ]

        for room_id, room in list(self.rooms.items()):

            if player_id in room["players"]:

                opponent = next(
                    (p for p in room["players"] if p != player_id),
                    None
                )

                del self.rooms[room_id]

                return room_id, opponent

        return None, None


game_manager = GameManager()
