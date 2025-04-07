import { checkSchema } from 'express-validator';

const findAvailableRooms = checkSchema({
  checkInDate: {
    notEmpty: {
      errorMessage: {
        msg: 'No booking date has been entered',
      },
    },
  },
  checkOutDate: {
    notEmpty: {
      errorMessage: {
        msg: 'Check-out date has not been entered',
      },
    },
  },
  city: {
    notEmpty: {
      errorMessage: {
        msg: 'Not entered city school ',
      },
    },
  },
  capacity: {
    notEmpty: {
      errorMessage: {
        msg: 'Quantity field not entered',
      },
    },
  },
  room: {
    notEmpty: {
      errorMessage: {
        msg: 'Not entered room',
      },
    },
  },
});
export { findAvailableRooms };
