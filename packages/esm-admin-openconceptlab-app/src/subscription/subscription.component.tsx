import { showNotification, showToast } from '@openmrs/esm-framework';
import {
  Button,
  ButtonSkeleton,
  Checkbox,
  Form,
  FormGroup,
  Grid,
  Row,
  Tab,
  Tabs,
  TextInput,
  TextInputSkeleton,
} from 'carbon-components-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { deleteSubscription, updateSubscription, useSubscription } from './subscription.resource';
import styles from './subscription.component.scss';

const Subscription: React.FC = () => {
  const { t } = useTranslation();
  const [subscriptionUrl, setSubscriptionUrl] = useState('');
  const [token, setToken] = useState('');
  const [isSubscribedToSnapshot, setIsSubscribedToSnapshot] = useState(false);
  const [validationType, setValidationType] = useState<'NONE' | 'FULL'>('FULL');

  const { data: subscription, isLoading, isError } = useSubscription();

  useEffect(() => {
    if (!isLoading) {
      setSubscriptionUrl(subscription?.url);
      setToken(subscription?.token);
      setIsSubscribedToSnapshot(subscription?.subscribedToSnapshot);
      setValidationType(subscription?.validationType);
    }
  }, [isLoading, isError, subscription]);

  const handleChangeSubscriptionUrl = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSubscriptionUrl(event.target.value);
  }, []);

  const handleChangeToken = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setToken(event.target.value);
  }, []);

  const handleChangeValidationType = useCallback((checked: boolean) => {
    setValidationType(checked ? 'NONE' : 'FULL');
  }, []);

  const handleChangeSubscriptionType = useCallback((checked: boolean) => {
    setIsSubscribedToSnapshot(checked);
  }, []);

  const handleSubmit = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      evt.stopPropagation();

      const abortController = new AbortController();

      const response = await updateSubscription(
        {
          ...subscription,
          url: subscriptionUrl,
          token: token,
          validationType: validationType,
          subscribedToSnapshot: isSubscribedToSnapshot,
        },
        abortController,
      );

      if (response.ok) {
        showToast({
          kind: 'success',
          description: t(response.status === 201 ? 'subscriptionCreated' : 'subscriptionUpdated'),
        });
      } else {
        showNotification({
          title: t('errorSavingSubscription'),
          kind: 'error',
          critical: true,
          description: response.data,
        });
      }

      return () => abortController.abort();
    },
    [subscriptionUrl, token, validationType, isSubscribedToSnapshot, t, subscription],
  );

  const handleUnsubscribe = useCallback(
    async (evt: React.FormEvent<HTMLFormElement>) => {
      evt.preventDefault();
      evt.stopPropagation();
      const abortController = new AbortController();

      const response = await deleteSubscription(subscription, abortController);

      if (response.status === 204) {
        setSubscriptionUrl('');
        setToken('');
        setIsSubscribedToSnapshot(false);
        setValidationType('FULL');
        showToast({
          kind: 'success',
          description: 'Successfully unsubscribed.',
        });
      } else {
        showNotification({
          title: 'Error unsubscribing',
          kind: 'error',
          critical: true,
          description: response.data,
        });
      }

      return () => abortController.abort();
    },
    [subscription],
  );

  if (isLoading) {
    return (
      <Grid>
        <Row>
          <Form>
            <FormGroup legendText={t('setupSubscription')}>
              <TextInputSkeleton id="subscriptionUrl" />
              <TextInputSkeleton id="apiToken" />
              <ButtonSkeleton />
              <ButtonSkeleton />
            </FormGroup>
          </Form>
          <Form>
            <p></p>
            <ButtonSkeleton />
          </Form>
        </Row>
      </Grid>
    );
  }

  return (
    <div>
      <h3 className={styles.moduleHeader}>OCL Subscription Module</h3>
      <Tabs className={styles.tabs} type="container">
        <Tab label="Subscription" key="0" id="sub">
          <div className={styles.tabContentContainer}>
            <Form onSubmit={handleSubmit}>
              <h3 className={styles.productiveHeading03}>{t('setupSubscription')}</h3>
              <TextInput
                className={styles.input}
                id="subscriptionUrl"
                type="url"
                labelText={t('subscriptionUrl')}
                placeholder="https://api.openconceptlab.org/orgs/openmrs/collections/dictionary-name"
                value={subscriptionUrl}
                onChange={handleChangeSubscriptionUrl}
                light={true}
              />
              <TextInput
                className={styles.input}
                id="apiToken"
                type="password"
                placeholder="*************************************************"
                labelText={t('apiToken')}
                value={token}
                onChange={handleChangeToken}
                light={true}
              />
              <FormGroup legendText="Advanced Options" className={styles.formGroup}>
                <Checkbox
                  checked={isSubscribedToSnapshot}
                  onChange={handleChangeSubscriptionType}
                  labelText="Subscribe to SNAPSHOT versions (not recommended)"
                  id="checkbox-0"
                />
                <Checkbox
                  checked={validationType === 'NONE'}
                  onChange={handleChangeValidationType}
                  labelText="Disable validation (should be used with care for well curated collections or sources)"
                  id="checkbox-1"
                />
              </FormGroup>
              <Button kind="secondary">{t('cancelButton')}</Button>
              <Button kind="primary" type="submit">
                {t('subscribeButton')}
              </Button>
            </Form>
            <Form onSubmit={handleUnsubscribe} style={{ marginTop: '1rem' }}>
              <h3 className={styles.productiveHeading03}>{t('unsubscribeLegend')}</h3>
              <p style={{ paddingBottom: '1rem' }}>{t('unsubscribeInfo')}</p>
              <Button kind="danger" type="submit" disabled={!subscription}>
                {t('unsubscribeButton')}
              </Button>
            </Form>
          </div>
        </Tab>
        <Tab label="Import" key="1" id="import" />
        <Tab label="Previous Imports" key="2" id="prev_imports" />
      </Tabs>
    </div>
    // <Grid>
    //   <Row>
    //     <h3>{t('subscriptionTitle')}</h3>
    //   </Row>
    //   <Tabs type="container">
    //     <Tab label="Subscription" key="0" id="subscription">
    //       <div>
    //         <Tile>
    //           <Form onSubmit={handleSubmit}>
    //             <FormGroup legendText={t('setupSubscription')}>
    //               <TextInput
    //                 id="subscriptionUrl"
    //                 type="url"
    //                 labelText={t('subscriptionUrl')}
    //                 value={subscriptionUrl}
    //                 onChange={handleChangeSubscriptionUrl}
    //               />
    //               <PasswordInput id="apiToken" labelText={t('apiToken')} value={token} onChange={handleChangeToken} />
    //               <Button kind="secondary">{t('cancelButton')}</Button>
    //               <Button kind="primary" type="submit">
    //                 {t('subscribeButton')}
    //               </Button>
    //             </FormGroup>
    //           </Form>
    //           <Form onSubmit={handleUnsubscribe}>
    //             <FormGroup legendText={t('unsubscribeLegend')}>
    //               <p>{t('unsubscribeInfo')}</p>
    //               <Button kind="primary" type="submit" disabled={!subscription}>
    //                 {t('unsubscribeButton')}
    //               </Button>
    //             </FormGroup>
    //           </Form>
    //         </Tile>
    //       </div>
    //     </Tab>
    //     <Tab label="Import" key="1" id="import"></Tab>
    //     <Tab label="Previous Imports" key="2" id="prev_imports" />
    //   </Tabs>
    // </Grid>
  );
};

export default Subscription;
