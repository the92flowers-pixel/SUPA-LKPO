"use client";

import React, { useState } from 'react';
import { Form, Field } from 'shadcn/form';

const ReleaseForm = () => {
  const [coverLink, setCoverLink] = useState('');

  const handleSubmit = (data) => {
    // Process form data
    console.log(data);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* ... */}
      <Field label="Cover" type="text">
        {({ input }) => (
          <input
            type="text"
            value={coverLink}
            onChange={(e) => setCoverLink(e.target.value)}
          />
        )}
      </Field>
    </Form>
  );
};

export default ReleaseForm;