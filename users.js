module.exports = { findUserByName, findUserByNameOnly, findUserById, makeUser, removeUser, importUser };


const { getDate } = require("./getDate.js");


function findUserByNameOnly(userCollection, userName) {
	return userCollection.find({ name: userName }).toArray();
}
function findUserByName(userCollection, userName, userPassword) {
	return userCollection.find({ name: userName, password: userPassword }).toArray();
}
function findUserById(userCollection, userId) {
	return userCollection.find({ _id: userId }).toArray();
}
async function makeUser(userCollection, userName, userPassword) {
	var user = createUserObj(userName, userPassword);
	var returnValue = await userCollection.insertOne(user);
	user._id = returnValue.insertedId;

	return user;
}
function importUser(loadedUser) {
	var user = createUserObj(loadedUser.name, loadedUser.password);
	user._id = loadedUser._id;
	user.recentRoomIds = loadedUser.recentRoomIds;

	return user;
}
function createUserObj(userName, userPassword) {
	return {
		name: userName,
		password: userPassword,
		sockets: [],
		recentRoomIds: [],
		currentRoomIds: [],
		hoursActive: 0,

		enterRoom: function (userCollection, room) {
			//update recent rooms
			var index = -1;
			for (var i = 0; i < this.recentRoomIds.length; i++) {
				if (this.recentRoomIds[i].roomId.equals(room._id)) {
					index = i;
					break;
				}
			}

			if (index != -1) {
				console.log(`${user.name} has already been in room`);
				this.recentRoomIds.splice(index, 1);
			}
			//set as first room in recent room ids
			this.recentRoomIds.unshift({ roomId: room._id, lastAccessed: getDate() });

			//update current rooms
			var index2 = this.currentRoomIds.indexOf(room._id);
			if (index2 == -1) {
				this.currentRoomIds.push(room._id);
			}

			//update recent rooms on database
			const filter = {
				_id: this._id
			};
			const update = {
				$set: {
					recentRoomIds: this.recentRoomIds
				}
			};

			console.log('Updating database on user recent rooms...');
			userCollection.updateOne(filter, update).then(res => {
				console.log('Updating database completed.');
			}).catch(err => {
				console.log('Updating database on user recent rooms error: ' + err);
			});
		},
		leaveRoom: function (roomId) {
			//update current rooms
			var index2 = this.currentRoomIds.indexOf(roomId);
			if (index2 != -1) {
				this.currentRoomIds.slice(index, 1);
			}
		}
	};
}
function removeUser(user) {

}