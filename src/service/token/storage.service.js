const CUSTOMER_ID = "jw_id";
const UNREAD_WIDGET_MESSAGES = "unread_widget_messages";
const READ_JWIDGET_MESSAGES = "read_jwidget_messages";
const START_DATE = "START_DATE";
const DATE_TIME_STAMP = "startDateTimestamp";

export const StorageService = {
  setCustomerIdToken(widgetToken) {
    localStorage.setItem(CUSTOMER_ID, widgetToken);
  },

  saveMainDomain(id, domain) {
    console.log({ id, domain });
    let now = new Date();
    let expirationDate = new Date();
    expirationDate.setFullYear(now.getFullYear() + 1);
    document.cookie =
      `${CUSTOMER_ID}=${id};expires=` +
      expirationDate.toUTCString() +
      `;domain=${domain};path=/`;
  },

  getCustomerIdTocken() {
    return localStorage.getItem(CUSTOMER_ID);
  },

  deleteCustomerIdTocken() {
    localStorage.removeItem(CUSTOMER_ID);
  },

  setUnreadMessagesCount(messagesCount) {
    localStorage.setItem(UNREAD_WIDGET_MESSAGES, messagesCount);
  },

  getUnreadMessagesCount() {
    return localStorage.getItem(UNREAD_WIDGET_MESSAGES);
  },

  setReadJWidgetMessages(readMessagesCount) {
    return localStorage.setItem(READ_JWIDGET_MESSAGES, readMessagesCount);
  },

  getReadJWidgetMessages() {
    return localStorage.getItem(READ_JWIDGET_MESSAGES);
  },

  setStartDate(date) {
    localStorage.setItem(START_DATE, date);
  },

  getStartDate(date) {
    return localStorage.getItem(START_DATE);
  },

  setStartDateTimeStamp(date) {
    localStorage.setItem(DATE_TIME_STAMP, date);
  },

  getStartDateTimeStamp(date) {
    return localStorage.getItem(DATE_TIME_STAMP);
  },
};
