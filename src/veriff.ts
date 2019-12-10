import { createTemplate } from './template';
import { createSession } from './xhr';

export interface FormLabel {
  [P: string]: string;
}

export interface PersonData {
  givenName?: string;
  lastName?: string;
  idNumber?: string;
}

export interface TemplateOptions {
  parentId?: string;
  person?: PersonData;
  formLabel?: FormLabel;
  submitBtnText?: string;
  vendorData?: string;
}

export interface Options extends TemplateOptions {
  host?: string;
  apiKey?: string;
  onSession?: (err, response) => void;
  loadingText?: string;
}

const DEFAULT_OPTIONS: Options = {
  host: 'https://api.veriff.me',
  parentId: 'veriff-root',
  loadingText: 'Loading...',
  submitBtnText: 'Start Verification',
  formLabel: {
    givenName: 'Given name',
    lastName: 'Last name',
    idNumber: 'Id number',
    vendorData: 'Data',
  },
  person: {
    givenName: '',
    lastName: '',
    idNumber: '',
  },
};

export function Veriff(options: Options = DEFAULT_OPTIONS) {
  const veriffOptions = options;

  function mount(): void {
    const {
      parentId,
      person,
      vendorData,
      formLabel,
      submitBtnText,
      loadingText,
      host,
      apiKey,
      onSession,
    } = veriffOptions;
    const form = createTemplate(<TemplateOptions>{
      parentId,
      person,
      vendorData,
      formLabel,
      submitBtnText,
    });

    form.onsubmit = (e) => {
      e.preventDefault();

      const givenName = form.givenName?.value || person.givenName;
      const lastName = form.lastName?.value || person.lastName;
      const data = typeof form.vendorData?.value === 'string' ? form.vendorData?.value : vendorData;

      if (!givenName || !lastName) {
        throw new Error('Required parameters givenName or lastName is missing');
      }

      form.submitBtn.value = loadingText;
      form.submitBtn.disabled = true;
      createSession(host, apiKey, person, data, (err, response) => {
        if (onSession) {
          onSession(err, response);
        }
        form.submitBtn.value = submitBtnText;
        form.submitBtn.disabled = false;
      });
    };
  }

  return {
    mount,
  };
}
