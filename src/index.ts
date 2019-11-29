import './styles/style.css';
import { createTemplate, PersonData, FormLabel } from './template';
import { createSession } from './xhr';
import { createVeriffFrame, CreationFrameOptions } from './frame';

interface Options {
  host?: string;
  apiKey: string;
  parentId: string;
  onSession: (err, response) => void;
}

interface MountOptions {
  formLabel?: FormLabel;
  submitBtnText?: string;
  loadingText?: string;
}

interface Params {
  person?: PersonData;
  vendorData?: string;
}

const Veriff = (options: Options) => {
  const { host = 'https://api.veriff.me', apiKey, parentId, onSession } = options;
  let params: Params = {
    person: {},
  };
  let veriffForm: HTMLFormElement;

  function setParams(newParams: Params): void {
    params = { ...params, ...newParams };
  }

  function assignSubmit(form, loadingText = 'Loading...', submitBtnText = 'Start Verification'): HTMLFormElement {
    form.onsubmit = (e) => {
      e.preventDefault();

      const givenName = veriffForm.givenName?.value || params.person.givenName;
      const lastName = veriffForm.lastName?.value || params.person.lastName;
      const idNumber = params.person?.idNumber;
      const vendorData =
        typeof veriffForm.vendorData?.value === 'string' ? veriffForm.vendorData?.value : params.vendorData;

      if (!givenName || !lastName) {
        throw new Error('Required parameters givenName or lastName is missing');
      }

      setParams({ person: { givenName, lastName, idNumber }, vendorData });
      form.submitBtn.value = loadingText;
      form.submitBtn.disabled = true;
      createSession(host, apiKey, params, (err, response) => {
        onSession(err, response);
        form.submitBtn.value = submitBtnText;
        form.submitBtn.disabled = false;
      });
    };

    return form;
  }

  function updateParams(newParams: Params, mountOptions: MountOptions = {}, frame: CreationFrameOptions): void {
    params = { ...newParams };
    frameOptions = frame;
    const { formLabel, loadingText, submitBtnText } = mountOptions;
    const form = createTemplate(parentId, { ...newParams, formLabel, submitBtnText });
    veriffForm = assignSubmit(form, loadingText, submitBtnText);
  }

  function mount(mountOptions: MountOptions = {}): void {
    const { formLabel, loadingText, submitBtnText } = mountOptions;
    const form = createTemplate(parentId, {
      person: params.person,
      vendorData: params.vendorData,
      formLabel,
      submitBtnText,
    });

    veriffForm = assignSubmit(form, loadingText, submitBtnText);
  }

  function createFrame(frameOptions: CreationFrameOptions) {
    createVeriffFrame(frameOptions);
  }

  return {
    params: params,
    setParams: setParams,
    updateParams: updateParams,
    mount: mount,
    createVeriffFrame: createFrame,
  };
};

export = Veriff;
