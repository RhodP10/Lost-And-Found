<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Item } from '$lib/types';

  // Define event types for TypeScript
  interface ClaimFormEvents {
    submit: {
      item_id: number;
      claimant_name: string;
      claimant_email: string;
      claimant_phone: string | null;
      student_id: string | null;
      proof_description: string;
      notes: string | null;
    };
    cancel: void;
  }

  export let item: Item;
  export let isSubmitting = false;

  // Form data
  let claimantName = '';
  let claimantEmail = '';
  let claimantPhone = '';
  let studentId = '';
  let proofDescription = '';
  let notes = '';

  // Form validation
  let errors = {
    claimantName: '',
    claimantEmail: '',
    proofDescription: ''
  };

  // Event dispatcher with typed events
  const dispatch = createEventDispatcher<ClaimFormEvents>();

  // Validate form
  function validateForm() {
    let isValid = true;
    errors = {
      claimantName: '',
      claimantEmail: '',
      proofDescription: ''
    };

    if (!claimantName.trim()) {
      errors.claimantName = 'Name is required';
      isValid = false;
    }

    if (!claimantEmail.trim()) {
      errors.claimantEmail = 'Email is required';
      isValid = false;
    } else if (!isValidEmail(claimantEmail)) {
      errors.claimantEmail = 'Please enter a valid email address';
      isValid = false;
    }

    if (!proofDescription.trim()) {
      errors.proofDescription = 'Please provide details to prove ownership';
      isValid = false;
    }

    return isValid;
  }

  // Email validation helper
  function isValidEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Handle form submission
  function handleSubmit() {
    console.log('Form submitted, validating...');
    if (validateForm()) {
      console.log('Form validation passed');
      // Ensure item.id is a number
      if (typeof item.id !== 'number') {
        console.error('Item ID is not a number:', item.id);
        return;
      }

      const claimData = {
        item_id: item.id,
        claimant_name: claimantName,
        claimant_email: claimantEmail,
        claimant_phone: claimantPhone || null,
        student_id: studentId || null,
        proof_description: proofDescription,
        notes: notes || null
      };

      console.log('Dispatching submit event with data:', claimData);
      dispatch('submit', claimData);
    } else {
      console.log('Form validation failed with errors:', errors);
    }
  }

  // Handle cancel
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="claim-form">
  <h2 class="form-title">Claim This Item</h2>

  <p class="form-description">
    To claim this item, please provide the following information. We'll review your claim
    and contact you if we need additional information.
  </p>

  <form on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="claimant-name">Your Name <span class="required">*</span></label>
      <input
        type="text"
        id="claimant-name"
        bind:value={claimantName}
        disabled={isSubmitting}
        class:error={errors.claimantName}
      />
      {#if errors.claimantName}
        <div class="error-message">{errors.claimantName}</div>
      {/if}
    </div>

    <div class="form-group">
      <label for="claimant-email">Your Email <span class="required">*</span></label>
      <input
        type="email"
        id="claimant-email"
        bind:value={claimantEmail}
        disabled={isSubmitting}
        class:error={errors.claimantEmail}
      />
      {#if errors.claimantEmail}
        <div class="error-message">{errors.claimantEmail}</div>
      {/if}
    </div>

    <div class="form-group">
      <label for="claimant-phone">Your Phone Number</label>
      <input
        type="tel"
        id="claimant-phone"
        bind:value={claimantPhone}
        disabled={isSubmitting}
        placeholder="Optional"
      />
    </div>

    <div class="form-group">
      <label for="student-id">Student ID (if applicable)</label>
      <input
        type="text"
        id="student-id"
        bind:value={studentId}
        disabled={isSubmitting}
        placeholder="Optional"
      />
    </div>

    <div class="form-group">
      <label for="proof-description">
        Proof of Ownership <span class="required">*</span>
        <span class="label-hint">Please describe the item in detail or provide information that only the owner would know</span>
      </label>
      <textarea
        id="proof-description"
        bind:value={proofDescription}
        disabled={isSubmitting}
        class:error={errors.proofDescription}
        rows="4"
      ></textarea>
      {#if errors.proofDescription}
        <div class="error-message">{errors.proofDescription}</div>
      {/if}
    </div>

    <div class="form-group">
      <label for="notes">Additional Notes</label>
      <textarea
        id="notes"
        bind:value={notes}
        disabled={isSubmitting}
        placeholder="Optional - Any additional information that might help us verify your claim"
        rows="3"
      ></textarea>
    </div>

    <div class="form-actions">
      <button type="button" class="cancel-button" on:click={handleCancel} disabled={isSubmitting}>
        Cancel
      </button>
      <button type="submit" class="submit-button" disabled={isSubmitting}>
        {#if isSubmitting}
          Submitting...
        {:else}
          Submit Claim
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  .claim-form {
    background-color: white;
    border-radius: 0.75rem;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .form-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-dark);
    margin-bottom: 1rem;
  }

  .form-description {
    margin-bottom: 1.5rem;
    color: #4a5568;
    line-height: 1.5;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--color-dark);
  }

  .label-hint {
    display: block;
    font-weight: 400;
    font-size: 0.875rem;
    color: #718096;
    margin-top: 0.25rem;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px rgba(217, 131, 36, 0.1);
  }

  input.error, textarea.error {
    border-color: #e53e3e;
  }

  .error-message {
    color: #e53e3e;
    font-size: 0.875rem;
    margin-top: 0.375rem;
  }

  .required {
    color: #e53e3e;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 2rem;
  }

  .cancel-button {
    padding: 0.75rem 1.5rem;
    background-color: #e2e8f0;
    color: #4a5568;
    border: none;
    border-radius: 0.375rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .cancel-button:hover {
    background-color: #cbd5e0;
  }

  .submit-button {
    padding: 0.75rem 1.5rem;
    background-color: var(--color-accent);
    color: white;
    border: none;
    border-radius: 0.375rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .submit-button:hover {
    background-color: #c67620;
  }

  button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
</style>
