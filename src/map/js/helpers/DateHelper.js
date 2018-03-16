
class DateHelper {

  getDate (date) {
    // NEW FORMAT (02/12/17)
    return date.format('DD MMM YYYY').toUpperCase();
    // OLD FORMAT
    // let whatDay = this.getDayOfWeek(date);
    // let whatMonth = this.getMonth(date);
    // let fullDate = whatDay + ', ' + date.date() + ' ' + whatMonth + ' ' + date.year();
    // return fullDate;
  }

  getDayOfWeek(date) {
    let dayOfWeek;
    switch (date.day()) {
      case 0:
        dayOfWeek = 'Sunday';
        break;
      case 1:
        dayOfWeek = 'Monday';
        break;
      case 2:
        dayOfWeek = 'Tuesday';
        break;
      case 3:
        dayOfWeek = 'Wednesday';
        break;
      case 4:
        dayOfWeek = 'Thursday';
        break;
      case 5:
        dayOfWeek = 'Friday';
        break;
      case 6:
        dayOfWeek = 'Saturday';
          break;
    }
    return dayOfWeek;
  }

  getMonth(date) {
    let month;
    switch (date.month()) {
      case 0:
        month = 'January';
        break;
      case 1:
        month = 'February';
        break;
      case 2:
        month = 'March';
        break;
      case 3:
        month = 'April';
        break;
      case 4:
        month = 'May';
        break;
      case 5:
        month = 'June';
        break;
      case 6:
        month = 'July';
        break;
      case 7:
        month = 'August';
        break;
      case 8:
        month = 'September';
        break;
      case 9:
        month = 'October';
        break;
      case 10:
        month = 'November';
        break;
      case 11:
        month = 'December';
        break;
    }
    return month;
  }

}

export default new DateHelper();
