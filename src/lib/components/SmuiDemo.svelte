<script>
  import Button, { Label } from '@smui/button';
  import Card, { Content, PrimaryAction, Media, MediaContent, Actions } from '@smui/card';
  import Dialog, { Title, Content as DialogContent, Actions as DialogActions } from '@smui/dialog';
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';
  import List, { Item, Text } from '@smui/list';
  import Paper from '@smui/paper';
  
  // Dialog state
  let dialogOpen = false;
  let name = '';
  
  function openDialog() {
    dialogOpen = true;
  }
  
  function closeDialog() {
    dialogOpen = false;
  }
  
  function handleSubmit() {
    alert(`Hello, ${name}!`);
    closeDialog();
  }
</script>

<div class="smui-demo">
  <h2>SMUI Components Demo</h2>
  
  <section class="demo-section">
    <h3>Buttons</h3>
    <div class="button-container">
      <Button variant="raised" on:click={openDialog}>
        <Label>Open Dialog</Label>
      </Button>
      
      <Button variant="outlined">
        <Label>Outlined Button</Label>
      </Button>
      
      <Button>
        <Label>Text Button</Label>
      </Button>
    </div>
  </section>
  
  <section class="demo-section">
    <h3>Cards</h3>
    <div class="card-container">
      <Card>
        <Media class="card-media-16x9" aspectRatio="16x9">
          <MediaContent>
            <div style="color: white; position: absolute; bottom: 16px; left: 16px;">
              <h3 class="mdc-typography--headline6">Lost and Found</h3>
              <h4 class="mdc-typography--subtitle2">A better way to find your items</h4>
            </div>
          </MediaContent>
        </Media>
        <Content>
          <h2 class="mdc-typography--headline6">Material Design Card</h2>
          <p class="mdc-typography--body2">
            Cards contain content and actions about a single subject.
          </p>
        </Content>
        <Actions>
          <Button>
            <Label>View Details</Label>
          </Button>
        </Actions>
      </Card>
    </div>
  </section>
  
  <section class="demo-section">
    <h3>Paper</h3>
    <div class="paper-container">
      <Paper elevation={1} class="paper-item">Elevation 1</Paper>
      <Paper elevation={2} class="paper-item">Elevation 2</Paper>
      <Paper elevation={4} class="paper-item">Elevation 4</Paper>
      <Paper elevation={8} class="paper-item">Elevation 8</Paper>
    </div>
  </section>
  
  <section class="demo-section">
    <h3>Lists</h3>
    <div class="list-container">
      <List twoLine>
        <Item>
          <Text>
            <span class="mdc-typography--headline6">Item 1</span>
            <span class="mdc-typography--body2">Description for item 1</span>
          </Text>
        </Item>
        <Item>
          <Text>
            <span class="mdc-typography--headline6">Item 2</span>
            <span class="mdc-typography--body2">Description for item 2</span>
          </Text>
        </Item>
        <Item>
          <Text>
            <span class="mdc-typography--headline6">Item 3</span>
            <span class="mdc-typography--body2">Description for item 3</span>
          </Text>
        </Item>
      </List>
    </div>
  </section>
</div>

<Dialog
  bind:open={dialogOpen}
  aria-labelledby="dialog-title"
  aria-describedby="dialog-content"
>
  <Title id="dialog-title">Enter Your Name</Title>
  <DialogContent id="dialog-content">
    <Textfield variant="outlined" bind:value={name} label="Name">
      <HelperText slot="helper">Please enter your name</HelperText>
    </Textfield>
  </DialogContent>
  <DialogActions>
    <Button on:click={closeDialog}>
      <Label>Cancel</Label>
    </Button>
    <Button variant="raised" on:click={handleSubmit}>
      <Label>Submit</Label>
    </Button>
  </DialogActions>
</Dialog>

<style>
  .smui-demo {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .demo-section {
    margin-bottom: 2rem;
    padding: 1rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }
  
  h2 {
    margin-bottom: 2rem;
    text-align: center;
  }
  
  h3 {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .button-container {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .card-container {
    max-width: 350px;
  }
  
  .card-media-16x9 {
    background-image: url('https://via.placeholder.com/350x200/D98324/FFFFFF?text=Lost+and+Found');
    background-size: cover;
    background-position: center;
  }
  
  .paper-container {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .paper-item {
    padding: 1rem;
    width: 150px;
    text-align: center;
  }
  
  .list-container {
    max-width: 400px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }
</style>
