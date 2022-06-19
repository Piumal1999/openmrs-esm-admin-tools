import { Grid } from 'carbon-components-react';
import { Section } from 'carbon-components-react/lib/components/Heading';
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import { SWRConfig } from 'swr';
import Subscription from './subscription/subscription.component';

const Root: React.FC = () => {
  return (
    <SWRConfig>
      <main className="omrs-main-content" style={{ backgroundColor: 'white' }}>
        <BrowserRouter basename={`${window.getOpenmrsSpaBase()}ocl/`}>
          <Route path="/subscription" component={Subscription} />
        </BrowserRouter>
      </main>
    </SWRConfig>
  );
};

export default Root;
