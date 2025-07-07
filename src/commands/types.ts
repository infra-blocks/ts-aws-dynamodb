export interface Command<Input, AwsCommand> {
  toAwsCommandInput(): Input;
  toAwsCommand(): AwsCommand;
}
