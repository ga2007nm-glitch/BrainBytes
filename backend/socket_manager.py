
import socketio

from game_manager import game_manager
from database import save_match

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*"
)


@sio.event
async def connect(sid, environ, auth=None):

    print("Player connected:", sid)


@sio.on("join_queue")
async def join_queue(sid, data=None):

    room_id = game_manager.add_player(sid)

    if room_id is None:

        await sio.emit(
            "waiting",
            {"message": "Waiting for another wizard..."},
            to=sid
        )

        return

    room = game_manager.rooms[room_id]

    for player in room["players"]:
        await sio.enter_room(player, room_id)

    await sio.emit(
        "game_started",
        {
            "room_id": room_id,
            "game": game_manager.get_game_state(room_id),
            "question": game_manager.get_public_question(room_id)
        },
        room=room_id
    )


@sio.on("submit_answer")
async def submit_answer(sid, data):

    room_id = data.get("room_id")
    answer = data.get("answer")

    if not room_id or answer is None:
        return

    result = game_manager.submit_answer(
        room_id,
        sid,
        answer
    )

    status = result["status"]

    if status == "wrong":

        await sio.emit(
            "wrong_answer",
            {"message": "Incorrect answer!"},
            to=sid
        )

        return

    if status != "correct" and status != "game_over":

        await sio.emit(
            "error_message",
            {"message": status},
            to=sid
        )

        return

    if status == "game_over":

        winner = result["winner"]

        await sio.emit(
            "game_over",
            {
                "winner": winner,
                "game": game_manager.get_game_state(room_id)
            },
            room=room_id
        )

        try:
            save_match(room_id, winner)
        except Exception as error:
            print("Could not save match:", error)

        return

    await sio.emit(
        "game_update",
        {
            "game": game_manager.get_game_state(room_id),
            "question": game_manager.get_public_question(room_id)
        },
        room=room_id
    )


@sio.event
async def disconnect(sid, *args):

    print("Player disconnected:", sid)

    room_id, opponent = game_manager.remove_player(sid)

    if room_id and opponent:

        await sio.emit(
            "opponent_disconnected",
            {"message": "Your opponent disconnected!"},
            to=opponent
        )

        await sio.emit(
            "game_over",
            {
                "winner": opponent,
                "reason": "opponent_disconnected"
            },
            to=opponent
        )
