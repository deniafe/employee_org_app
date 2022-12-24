interface Employee {
uniqueId: number;
name: string;
subordinates: Employee[];
}

class EmployeeOrgApp implements IEmployeeOrgApp {
  private undoStack: Employee[][] = [];
  private redoStack: Employee[][] = [];

  constructor(public ceo: Employee) {}

  move(employeeID: number, supervisorID: number): void {
    const employee = this.findEmployeeById(employeeID);
    const supervisor = this.findEmployeeById(supervisorID);
    if (!employee || !supervisor) return;

    // Remove employee from its current supervisor's subordinates
    const oldSupervisor = this.findEmployeeBySubordinate(employee);
    if (oldSupervisor) {
      oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
        (e) => e !== employee
      );
    }

    // Add employee to the new supervisor's subordinates
    supervisor.subordinates.push(employee);

    // Push the old state of the employee's supervisor onto the undo stack
    this.undoStack.push(oldSupervisor ? [...oldSupervisor.subordinates] : []);
  }

  undo(): void {
    if (!this.undoStack.length) return;

    // Get the last state from the undo stack
    const oldState = this.undoStack.pop();

    // Find the employee whose move we want to undo
    const employee = oldState.find((e) => !e.subordinates.includes(e));
    if (!employee) return;

    // Find the employee's new supervisor
    const newSupervisor = this.findEmployeeBySubordinate(employee);
    if (!newSupervisor) return;

    // Remove the employee from the new supervisor's subordinates
    newSupervisor.subordinates = newSupervisor.subordinates.filter(
      (e) => e !== employee
    );

    // Add the employee to the old supervisor's subordinates (if it exists)
    if (oldState.length) {
      const oldSupervisor = this.findEmployeeById(oldState[0].uniqueId);
      if (oldSupervisor) oldSupervisor.subordinates.push(employee);
    }

    // Push the current state of the employee's new supervisor onto the redo stack
    this.redoStack.push([...newSupervisor.subordinates]);
  }

  redo(): void {
    if (!this.redoStack.length) return;

    // Get the last state from the redo stack
    const oldState = this.redoStack.pop();

    // Find the employee whose move we want to redo
    const employee = oldState.find((e) => !e.subordinates.includes(e));
    if (!employee) return;

    // Find the employee's old supervisor
    const oldSupervisor = this.findEmployeeById(oldState[0].uniqueId);
    if (!oldSupervisor) return;

    // Remove the employee from the old supervisor's subordinates
    oldSupervisor.subordinates = oldSupervisor.subordinates.filter(
      (e) => e !== employee
    );

    // Find the employee's new supervisor
    const newSupervisor = this.findEmployeeBySubordinate(employee);
    if (!newSupervisor) return;
  }
}

    //
