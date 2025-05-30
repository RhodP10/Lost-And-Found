<script>
  // Define the steps data
  const steps = [
    {
      number: 1,
      title: "Report an Item",
      description: "Report a lost or found item with details and optional photo.",
      icon: "add_circle",
      color: "#D98324",
      link: "/report",
      linkText: "Report Now"
    },
    {
      number: 2,
      title: "Browse Listings",
      description: "Search through lost and found items to find a match.",
      icon: "search",
      color: "#443627",
      link: "/lost",
      linkText: "Browse Items"
    },
    {
      number: 3,
      title: "Get Connected",
      description: "Contact the reporter to arrange return of the item.",
      icon: "handshake",
      color: "#D98324",
      link: "/found",
      linkText: "View Found Items"
    }
  ];
</script>

<section class="how-it-works-section">
  <div class="section-header">
    <h2>How It Works</h2>
    <div class="section-subtitle">
      Simple steps to reunite with your lost items
    </div>
    <div class="section-divider"></div>
  </div>
  
  <div class="steps-container">
    <div class="steps-timeline">
      <div class="timeline-line"></div>
      {#each steps as step, index}
        <div class="timeline-dot" style="left: calc({index * 50}% + 25%)">
          <div class="dot-number">{step.number}</div>
        </div>
      {/each}
    </div>
    
    <div class="steps-cards">
      {#each steps as step, index}
        <div class="step-card" style="animation-delay: {index * 0.2}s">
          <div class="step-icon-container" style="background-color: {step.color}">
            <span class="material-icons step-icon">{step.icon}</span>
          </div>
          <h3 class="step-title">{step.title}</h3>
          <p class="step-description">{step.description}</p>
          <a href={step.link} class="step-link">
            <span>{step.linkText}</span>
            <span class="material-icons">arrow_forward</span>
          </a>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .how-it-works-section {
    padding: 4rem 0;
    background-color: #f9f9f9;
    position: relative;
    overflow: hidden;
  }
  
  .how-it-works-section::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d98324' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.5;
    z-index: 0;
  }
  
  .section-header {
    text-align: center;
    margin-bottom: 3rem;
    position: relative;
    z-index: 1;
  }
  
  .section-header h2 {
    margin: 0;
    color: var(--color-dark, #443627);
    font-size: 2.5rem;
    font-weight: 700;
  }
  
  .section-subtitle {
    color: #718096;
    margin: 0.5rem 0 1rem;
    font-size: 1.1rem;
  }
  
  .section-divider {
    width: 80px;
    height: 4px;
    background-color: var(--color-accent, #D98324);
    margin: 0 auto;
    border-radius: 2px;
  }
  
  .steps-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    position: relative;
    z-index: 1;
  }
  
  .steps-timeline {
    position: relative;
    height: 2px;
    background-color: rgba(0, 0, 0, 0.1);
    margin: 2rem 0 4rem;
    width: 50%;
    margin-left: 25%;
  }
  
  .timeline-line {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 0;
    background-color: var(--color-accent, #D98324);
    animation: timeline-progress 2s ease-out forwards;
    animation-delay: 0.5s;
  }
  
  .timeline-dot {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 40px;
    height: 40px;
    background-color: white;
    border: 2px solid var(--color-accent, #D98324);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    transition: all 0.3s ease;
    animation: dot-appear 0.5s ease-out forwards;
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
  
  .timeline-dot:nth-child(2) {
    animation-delay: 0.7s;
  }
  
  .timeline-dot:nth-child(3) {
    animation-delay: 0.9s;
  }
  
  .timeline-dot:nth-child(4) {
    animation-delay: 1.1s;
  }
  
  .dot-number {
    font-weight: 700;
    color: var(--color-accent, #D98324);
    font-size: 1.2rem;
  }
  
  .steps-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    margin-top: 2rem;
  }
  
  .step-card {
    background-color: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
    text-align: center;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
    animation: card-appear 0.6s ease-out forwards;
    opacity: 0;
    transform: translateY(20px);
  }
  
  .step-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  }
  
  .step-icon-container {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: white;
  }
  
  .step-icon {
    font-size: 32px;
  }
  
  .step-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem;
    color: var(--color-dark, #443627);
  }
  
  .step-description {
    color: #718096;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
  
  .step-link {
    display: inline-flex;
    align-items: center;
    color: var(--color-accent, #D98324);
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
  }
  
  .step-link:hover {
    color: #c67620;
  }
  
  .step-link .material-icons {
    font-size: 18px;
    margin-left: 4px;
    transition: transform 0.2s ease;
  }
  
  .step-link:hover .material-icons {
    transform: translateX(4px);
  }
  
  @keyframes timeline-progress {
    0% { width: 0; }
    100% { width: 100%; }
  }
  
  @keyframes dot-appear {
    to {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
  
  @keyframes card-appear {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    .steps-cards {
      grid-template-columns: 1fr;
    }
    
    .steps-timeline {
      display: none;
    }
    
    .step-card {
      margin-bottom: 2rem;
    }
  }
</style>
