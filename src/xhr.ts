import { PersonData } from './veriff';

const CREATED_RESPONSE_STATUS = 201;

export function createSession(
  host: string,
  apiKey: string,
  person: PersonData,
  data: string,
  cb: (statusObject, resp) => void
): void {
  const url = `${host}/v1/sessions`;
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.setRequestHeader('x-auth-client', apiKey);
  xhr.setRequestHeader('x-origin', 'js-sdk');
  xhr.onreadystatechange = (): void => {
    if (xhr.readyState !== XMLHttpRequest.DONE) {
      return;
    }
    if (xhr.status === CREATED_RESPONSE_STATUS) {
      const resp = JSON.parse(xhr.responseText);
      return cb(null, resp);
    }
    return cb(
      {
        status: xhr.status,
        statusText: xhr.statusText,
      },
      null
    );
  };

  const body = {
    verification: {
      person: {
        firstName: person.givenName,
        lastName: person.lastName,
        idNumber: person.idNumber,
      },
      vendorData: data,
      timestamp: new Date().toISOString(),
    },
  };

  const json = JSON.stringify(body);
  xhr.send(json);
}
