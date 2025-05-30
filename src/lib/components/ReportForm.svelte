<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Category } from '$lib/types';

  const dispatch = createEventDispatcher();

  // Props
  export let categories: Category[] = [];
  export let isLoading = false;
  export let errors: Record<string, string> = {};

  // Form data
  export let formData = {
    title: '',
    description: '',
    category: '',
    status: 'lost' as 'lost' | 'found',
    location: '',
    floor: '',
    roomNumber: '',
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    imageUrl: '',
    imageFile: null as File | null,
    imagePreview: ''
  };

  // Current step
  let currentStep = 1;
  const totalSteps = 4;

  // Floor options
  const floorOptions = [
    { value: '1st Floor', label: '1st Floor' },
    { value: '2nd Floor', label: '2nd Floor' },
    { value: '3rd Floor', label: '3rd Floor' },
    { value: '4th Floor', label: '4th Floor' },
    { value: '5th Floor', label: '5th Floor' }
  ];

  // Step validation
  function validateStep(step: number): boolean {
    const stepErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title.trim()) stepErrors.title = 'Title is required';
        if (!formData.category) stepErrors.category = 'Category is required';
        break;
      case 2:
        if (!formData.location.trim()) stepErrors.location = 'Location is required';
        if (!formData.floor) stepErrors.floor = 'Floor is required';
        if (!formData.roomNumber.trim()) stepErrors.roomNumber = 'Room number is required';
        break;
      case 3:
        if (!formData.reporterName.trim()) stepErrors.reporterName = 'Your name is required';
        if (!formData.reporterEmail.trim()) stepErrors.reporterEmail = 'Your email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.reporterEmail)) stepErrors.reporterEmail = 'Please enter a valid email';
        if (formData.reporterPhone && !/^\+?[0-9\s\-()]{7,}$/.test(formData.reporterPhone)) {
          stepErrors.reporterPhone = 'Please enter a valid phone number';
        }
        break;
    }

    // Update errors
    errors = { ...errors, ...stepErrors };

    return Object.keys(stepErrors).length === 0;
  }

  function nextStep() {
    if (validateStep(currentStep)) {
      currentStep = Math.min(currentStep + 1, totalSteps);
    }
  }

  function prevStep() {
    currentStep = Math.max(currentStep - 1, 1);
  }

  function handleImageUpload(event: Event) {
    dispatch('imageUpload', { event });
  }

  function handleSubmit() {
    if (validateStep(currentStep)) {
      dispatch('submit');
    }
  }

  function getStepTitle(step: number): string {
    switch (step) {
      case 1: return 'Item Details';
      case 2: return 'Location Information';
      case 3: return 'Contact Information';
      case 4: return 'Review & Submit';
      default: return '';
    }
  }

  function getStepIcon(step: number): string {
    switch (step) {
      case 1: return 'inventory_2';
      case 2: return 'place';
      case 3: return 'person';
      case 4: return 'check_circle';
      default: return 'circle';
    }
  }
</script>

<div class="report-form">
  <!-- Progress Steps -->
  <div class="steps-container">
    <div class="steps-header">
      <h2>Report {formData.status === 'lost' ? 'Lost' : 'Found'} Item</h2>
      <p>Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}</p>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: {(currentStep / totalSteps) * 100}%"></div>
    </div>

    <div class="steps-indicators">
      {#each Array(totalSteps) as _, index}
        <div class="step-indicator {currentStep > index + 1 ? 'completed' : currentStep === index + 1 ? 'active' : 'pending'}">
          <div class="step-circle">
            {#if currentStep > index + 1}
              <span class="material-icons">check</span>
            {:else}
              <span class="material-icons">{getStepIcon(index + 1)}</span>
            {/if}
          </div>
          <span class="step-label">{getStepTitle(index + 1)}</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Form Content -->
  <div class="form-content">
    <!-- Step 1: Item Type & Details -->
    {#if currentStep === 1}
      <div class="step-content">
        <div class="step-header">
          <span class="material-icons step-icon">inventory_2</span>
          <h3>What type of item are you reporting?</h3>
        </div>

        <div class="status-selection">
          <label class="status-option {formData.status === 'lost' ? 'selected' : ''}">
            <input type="radio" bind:group={formData.status} value="lost" />
            <div class="option-content">
              <span class="material-icons">search</span>
              <span class="option-title">I lost an item</span>
              <span class="option-desc">Report something you've lost</span>
            </div>
          </label>

          <label class="status-option {formData.status === 'found' ? 'selected' : ''}">
            <input type="radio" bind:group={formData.status} value="found" />
            <div class="option-content">
              <span class="material-icons">inventory_2</span>
              <span class="option-title">I found an item</span>
              <span class="option-desc">Report something you've found</span>
            </div>
          </label>
        </div>

        <div class="form-fields">
          <div class="field-group">
            <label for="title" class="field-label">
              <span class="material-icons">title</span>
              Item Title *
            </label>
            <input
              type="text"
              id="title"
              bind:value={formData.title}
              class="field-input {errors.title ? 'error' : ''}"
              placeholder="e.g. Blue Backpack, iPhone 13, etc."
            />
            {#if errors.title}
              <span class="field-error">{errors.title}</span>
            {/if}
          </div>

          <div class="field-group">
            <label for="category" class="field-label">
              <span class="material-icons">category</span>
              Category *
            </label>
            <select
              id="category"
              bind:value={formData.category}
              class="field-select {errors.category ? 'error' : ''}"
            >
              <option value="">Select a category</option>
              {#each categories as cat}
                <option value={cat.name}>{cat.name}</option>
              {/each}
            </select>
            {#if errors.category}
              <span class="field-error">{errors.category}</span>
            {/if}
          </div>

          <div class="field-group full-width">
            <label for="description" class="field-label">
              <span class="material-icons">description</span>
              Description
            </label>
            <textarea
              id="description"
              bind:value={formData.description}
              rows="4"
              class="field-textarea"
              placeholder="Provide details about the item..."
            ></textarea>
          </div>
        </div>
      </div>
    {/if}

    <!-- Step 2: Location -->
    {#if currentStep === 2}
      <div class="step-content">
        <div class="step-header">
          <span class="material-icons step-icon">place</span>
          <h3>Where was the item {formData.status === 'lost' ? 'lost' : 'found'}?</h3>
        </div>

        <div class="form-fields">
          <div class="field-group">
            <label for="location" class="field-label">
              <span class="material-icons">business</span>
              Building/Location *
            </label>
            <input
              type="text"
              id="location"
              bind:value={formData.location}
              class="field-input {errors.location ? 'error' : ''}"
              placeholder="Building or area name"
            />
            {#if errors.location}
              <span class="field-error">{errors.location}</span>
            {/if}
          </div>

          <div class="field-group">
            <label for="floor" class="field-label">
              <span class="material-icons">layers</span>
              Floor *
            </label>
            <select
              id="floor"
              bind:value={formData.floor}
              class="field-select {errors.floor ? 'error' : ''}"
            >
              <option value="">Select a floor</option>
              {#each floorOptions as floorOption}
                <option value={floorOption.value}>{floorOption.label}</option>
              {/each}
            </select>
            {#if errors.floor}
              <span class="field-error">{errors.floor}</span>
            {/if}
          </div>

          <div class="field-group">
            <label for="roomNumber" class="field-label">
              <span class="material-icons">meeting_room</span>
              Room Number *
            </label>
            <input
              type="text"
              id="roomNumber"
              bind:value={formData.roomNumber}
              class="field-input {errors.roomNumber ? 'error' : ''}"
              placeholder="e.g. 101, Lab 3, etc."
            />
            {#if errors.roomNumber}
              <span class="field-error">{errors.roomNumber}</span>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <!-- Step 3: Contact Information -->
    {#if currentStep === 3}
      <div class="step-content">
        <div class="step-header">
          <span class="material-icons step-icon">person</span>
          <h3>How can we contact you?</h3>
        </div>

        <div class="form-fields">
          <div class="field-group">
            <label for="reporterName" class="field-label">
              <span class="material-icons">badge</span>
              Your Name *
            </label>
            <input
              type="text"
              id="reporterName"
              bind:value={formData.reporterName}
              class="field-input {errors.reporterName ? 'error' : ''}"
              placeholder="Enter your full name"
            />
            {#if errors.reporterName}
              <span class="field-error">{errors.reporterName}</span>
            {/if}
          </div>

          <div class="field-group">
            <label for="reporterEmail" class="field-label">
              <span class="material-icons">email</span>
              Your Email *
            </label>
            <input
              type="email"
              id="reporterEmail"
              bind:value={formData.reporterEmail}
              class="field-input {errors.reporterEmail ? 'error' : ''}"
              placeholder="your.email@example.com"
            />
            {#if errors.reporterEmail}
              <span class="field-error">{errors.reporterEmail}</span>
            {/if}
          </div>

          <div class="field-group">
            <label for="reporterPhone" class="field-label">
              <span class="material-icons">phone</span>
              Your Phone (Optional)
            </label>
            <input
              type="tel"
              id="reporterPhone"
              bind:value={formData.reporterPhone}
              class="field-input {errors.reporterPhone ? 'error' : ''}"
              placeholder="+1 (555) 123-4567"
            />
            {#if errors.reporterPhone}
              <span class="field-error">{errors.reporterPhone}</span>
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <!-- Step 4: Image & Review -->
    {#if currentStep === 4}
      <div class="step-content">
        <div class="step-header">
          <span class="material-icons step-icon">photo_camera</span>
          <h3>Add a photo (optional) and review your report</h3>
        </div>

        <div class="image-upload-section">
          <div class="upload-area">
            <input
              type="file"
              id="image"
              accept="image/*"
              on:change={handleImageUpload}
              class="file-input"
            />
            <label for="image" class="upload-label">
              <span class="material-icons">cloud_upload</span>
              <span>Click to upload an image</span>
              <span class="upload-hint">Max 5MB, JPEG, PNG, GIF, or WebP</span>
            </label>
          </div>

          {#if formData.imagePreview}
            <div class="image-preview">
              <img src={formData.imagePreview} alt="Preview" />
            </div>
          {/if}

          <div class="url-input">
            <label for="imageUrl" class="field-label">
              <span class="material-icons">link</span>
              Or provide an image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              bind:value={formData.imageUrl}
              class="field-input"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <!-- Review Summary -->
        <div class="review-summary">
          <h4>Review Your Report</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="summary-label">Type:</span>
              <span class="summary-value">{formData.status === 'lost' ? 'Lost Item' : 'Found Item'}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Title:</span>
              <span class="summary-value">{formData.title}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Category:</span>
              <span class="summary-value">{formData.category}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Location:</span>
              <span class="summary-value">{formData.location}, {formData.floor}, Room {formData.roomNumber}</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">Contact:</span>
              <span class="summary-value">{formData.reporterName} ({formData.reporterEmail})</span>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Navigation Buttons -->
    <div class="form-navigation">
      {#if currentStep > 1}
        <button type="button" class="nav-button secondary" on:click={prevStep}>
          <span class="material-icons">arrow_back</span>
          Previous
        </button>
      {/if}

      <div class="nav-spacer"></div>

      {#if currentStep < totalSteps}
        <button type="button" class="nav-button primary" on:click={nextStep}>
          Next
          <span class="material-icons">arrow_forward</span>
        </button>
      {:else}
        <button
          type="button"
          class="nav-button submit"
          on:click={handleSubmit}
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="loading-spinner"></span>
            Submitting...
          {:else}
            <span class="material-icons">send</span>
            Submit Report
          {/if}
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .report-form {
    max-width: 800px;
    margin: 0 auto;
  }

  /* Steps Container */
  .steps-container {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .steps-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .steps-header h2 {
    margin: 0 0 0.5rem;
    color: var(--color-dark, #443627);
    font-size: 1.75rem;
    font-weight: 700;
  }

  .steps-header p {
    margin: 0;
    color: #718096;
    font-size: 1rem;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background-color: #e2e8f0;
    border-radius: 3px;
    margin-bottom: 2rem;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background-color: var(--color-accent, #D98324);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .steps-indicators {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .step-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .step-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
  }

  .step-indicator.pending .step-circle {
    background-color: #f7fafc;
    border: 2px solid #e2e8f0;
    color: #a0aec0;
  }

  .step-indicator.active .step-circle {
    background-color: var(--color-accent, #D98324);
    border: 2px solid var(--color-accent, #D98324);
    color: white;
  }

  .step-indicator.completed .step-circle {
    background-color: #38a169;
    border: 2px solid #38a169;
    color: white;
  }

  .step-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #4a5568;
  }

  /* Form Content */
  .form-content {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  }

  .step-content {
    min-height: 400px;
  }

  .step-header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .step-icon {
    font-size: 32px;
    color: var(--color-accent, #D98324);
    margin-right: 1rem;
  }

  .step-header h3 {
    margin: 0;
    color: var(--color-dark, #443627);
    font-size: 1.5rem;
    font-weight: 600;
  }

  /* Status Selection */
  .status-selection {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .status-option {
    cursor: pointer;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 1.5rem;
    transition: all 0.3s ease;
    position: relative;
  }

  .status-option:hover {
    border-color: var(--color-accent, #D98324);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(217, 131, 36, 0.15);
  }

  .status-option.selected {
    border-color: var(--color-accent, #D98324);
    background-color: rgba(217, 131, 36, 0.05);
  }

  .status-option input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .option-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .option-content .material-icons {
    font-size: 48px;
    color: var(--color-accent, #D98324);
    margin-bottom: 1rem;
  }

  .option-title {
    font-weight: 600;
    font-size: 1.125rem;
    color: var(--color-dark, #443627);
    margin-bottom: 0.5rem;
  }

  .option-desc {
    color: #718096;
    font-size: 0.875rem;
  }

  /* Form Fields */
  .form-fields {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  .field-group {
    display: flex;
    flex-direction: column;
  }

  .field-group.full-width {
    grid-column: span 2;
  }

  .field-label {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--color-dark, #443627);
  }

  .field-label .material-icons {
    font-size: 18px;
    margin-right: 0.5rem;
    color: var(--color-accent, #D98324);
  }

  .field-input,
  .field-select,
  .field-textarea {
    padding: 0.75rem 1rem;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s ease;
  }

  .field-input:focus,
  .field-select:focus,
  .field-textarea:focus {
    outline: none;
    border-color: var(--color-accent, #D98324);
    box-shadow: 0 0 0 3px rgba(217, 131, 36, 0.15);
  }

  .field-input.error,
  .field-select.error,
  .field-textarea.error {
    border-color: #e53e3e;
  }

  .field-error {
    color: #e53e3e;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  /* Image Upload */
  .image-upload-section {
    margin-bottom: 2rem;
  }

  .upload-area {
    position: relative;
    margin-bottom: 1rem;
  }

  .file-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
  }

  .upload-label:hover {
    border-color: var(--color-accent, #D98324);
    background-color: rgba(217, 131, 36, 0.05);
  }

  .upload-label .material-icons {
    font-size: 48px;
    color: var(--color-accent, #D98324);
    margin-bottom: 1rem;
  }

  .upload-hint {
    color: #718096;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  .image-preview {
    margin-bottom: 1rem;
  }

  .image-preview img {
    max-width: 100%;
    max-height: 200px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .url-input {
    margin-top: 1rem;
  }

  /* Review Summary */
  .review-summary {
    margin-top: 2rem;
    padding: 1.5rem;
    background-color: #f7fafc;
    border-radius: 8px;
  }

  .review-summary h4 {
    margin: 0 0 1rem;
    color: var(--color-dark, #443627);
  }

  .summary-grid {
    display: grid;
    gap: 0.75rem;
  }

  .summary-item {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 1rem;
  }

  .summary-label {
    font-weight: 500;
    color: #4a5568;
  }

  .summary-value {
    color: var(--color-dark, #443627);
  }

  /* Navigation */
  .form-navigation {
    display: flex;
    align-items: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
  }

  .nav-spacer {
    flex: 1;
  }

  .nav-button {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .nav-button .material-icons {
    font-size: 18px;
  }

  .nav-button.secondary {
    background-color: #f7fafc;
    color: #4a5568;
    border: 1px solid #e2e8f0;
  }

  .nav-button.secondary:hover {
    background-color: #edf2f7;
  }

  .nav-button.secondary .material-icons {
    margin-right: 0.5rem;
  }

  .nav-button.primary,
  .nav-button.submit {
    background-color: var(--color-accent, #D98324);
    color: white;
  }

  .nav-button.primary:hover,
  .nav-button.submit:hover:not(:disabled) {
    background-color: #c67620;
  }

  .nav-button.primary .material-icons,
  .nav-button.submit .material-icons {
    margin-left: 0.5rem;
  }

  .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .steps-indicators {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;
    }

    .status-selection {
      grid-template-columns: 1fr;
    }

    .form-fields {
      grid-template-columns: 1fr;
    }

    .field-group.full-width {
      grid-column: span 1;
    }

    .summary-item {
      grid-template-columns: 1fr;
      gap: 0.25rem;
    }
  }
</style>
