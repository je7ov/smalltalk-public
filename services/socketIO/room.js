class Rooms {
  constructor() {
    this.rooms = [];
  }

  /** @param {string} id
   *  @param {string} name
   *  @param {string} room
   */
  addUser(id, name, room) {
    let user;
    this.rooms.some(r => {
      if (r.name.toLowerCase() === room) {
        user = { id, name };
        r.users.push(user);
        return true;
      }
    });

    if (!user) {
      user = { id, name };
      this.rooms.push({
        name: room,
        users: [user]
      });
    }

    return user;
  }

  /** @param {string} id */
  removeUser(id) {
    let user;
    this.rooms.some((r, roomIndex) => {
      r.users.some((u, index) => {
        if (u.id === id) {
          user = u;
          user.room = r.name;
          r.users.splice(index, 1);
          this._cleanupRoom(roomIndex);
          return true;
        }
      });
      return user;
    });
    return user;
  }

  /** @param {string} id */
  getUser(id) {
    return this._getUserByProp('id', id);
  }

  /** @param {string} name */
  getUserByName(name) {
    return this._getUserByProp('name', name, true);
  }

  /** @param {string} name */
  getUsers(room) {
    room = room.toLowerCase();
    let users = [];
    this.rooms.some(r => {
      if (r.name.toLowerCase() === room) {
        users = r.users.map(u => u.name);
        return true;
      }
    });

    return users;
  }

  /** @param {string} propName
   *  @param {string} prop
   *  @param {boolean} toLowerCase
   */
  _getUserByProp(propName, prop, toLowerCase) {
    let user;
    if (toLowerCase) prop = prop.toLowerCase();

    this.rooms.some(r => {
      r.users.some(u => {
        let uProp = u[propName];
        if (toLowerCase) uProp = uProp.toLowerCase();
        if (uProp === prop) {
          user = u;
          user.room = r.name;
          return true;
        }
      });

      return user;
    });

    return user;
  }

  /** @param {number} roomIndex */
  _cleanupRoom(roomIndex) {
    if (this.rooms[roomIndex].users.length === 0)
      this.rooms.splice(roomIndex, 1);
  }
}

module.exports = Rooms;
