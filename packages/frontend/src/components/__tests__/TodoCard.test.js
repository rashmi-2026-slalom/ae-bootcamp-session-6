import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: '2025-12-25',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo title and due date', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
  });

  it('should render unchecked checkbox when todo is incomplete', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when todo is complete', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show edit button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should apply completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    const { container } = render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const card = container.querySelector('.todo-card');
    expect(card).toHaveClass('completed');
  });

  it('should not render due date when dueDate is null', () => {
    const todoNoDate = { ...mockTodo, dueDate: null };
    render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });

  // Overdue tests
  describe('Overdue visual indicators', () => {
    it('should render clock icon and amber styling for overdue todos', () => {
      const overdueTodo = { ...mockTodo, isOverdue: true, completed: 0 };
      const { container } = render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      // Check for clock icon
      const clockIcon = screen.getByRole('status', { name: /Overdue/i });
      expect(clockIcon).toBeInTheDocument();
      expect(clockIcon).toHaveClass('overdue-icon');
      expect(clockIcon).toHaveTextContent('⏰');
      
      // Check for overdue class on card
      const card = container.querySelector('.todo-card');
      expect(card).toHaveClass('overdue');
    });

    it('should not render overdue styling for non-overdue todos', () => {
      const nonOverdueTodo = { ...mockTodo, isOverdue: false, completed: 0 };
      const { container } = render(<TodoCard todo={nonOverdueTodo} {...mockHandlers} isLoading={false} />);
      
      // Clock icon should not be present
      expect(screen.queryByRole('status', { name: /Overdue/i })).not.toBeInTheDocument();
      
      // Overdue class should not be present
      const card = container.querySelector('.todo-card');
      expect(card).not.toHaveClass('overdue');
    });

    it('should not render overdue styling for completed overdue todos', () => {
      const completedOverdueTodo = { ...mockTodo, isOverdue: true, completed: 1 };
      const { container } = render(<TodoCard todo={completedOverdueTodo} {...mockHandlers} isLoading={false} />);
      
      // Clock icon should not be present (completion takes precedence)
      expect(screen.queryByRole('status', { name: /Overdue/i })).not.toBeInTheDocument();
      
      // Overdue class should not be present
      const card = container.querySelector('.todo-card');
      expect(card).not.toHaveClass('overdue');
      expect(card).toHaveClass('completed');
    });

    it('should handle boolean completed values', () => {
      const overdueTodo = { ...mockTodo, isOverdue: true, completed: false };
      const { container } = render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      // Clock icon should be present
      const clockIcon = screen.getByRole('status', { name: /Overdue/i });
      expect(clockIcon).toBeInTheDocument();
      
      // Overdue class should be present
      const card = container.querySelector('.todo-card');
      expect(card).toHaveClass('overdue');
    });

    it('should not render overdue styling for todos without isOverdue field', () => {
      const todoNoOverdueField = { ...mockTodo, completed: 0 };
      // Explicitly remove isOverdue field
      delete todoNoOverdueField.isOverdue;
      
      const { container } = render(<TodoCard todo={todoNoOverdueField} {...mockHandlers} isLoading={false} />);
      
      // Clock icon should not be present
      expect(screen.queryByRole('status', { name: /Overdue/i })).not.toBeInTheDocument();
      
      // Overdue class should not be present
      const card = container.querySelector('.todo-card');
      expect(card).not.toHaveClass('overdue');
    });
  });

  describe('Accessibility for overdue indicators', () => {
    it('should have proper ARIA label on clock icon', () => {
      const overdueTodo = { ...mockTodo, isOverdue: true, completed: 0 };
      render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      const clockIcon = screen.getByRole('status', { name: /Overdue/i });
      expect(clockIcon).toHaveAttribute('aria-label', 'Overdue');
      expect(clockIcon).toHaveAttribute('role', 'status');
    });

    it('should maintain checkbox accessibility with overdue todos', () => {
      const overdueTodo = { ...mockTodo, isOverdue: true, completed: 0 };
      render(<TodoCard todo={overdueTodo} {...mockHandlers} isLoading={false} />);
      
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label');
      expect(checkbox.getAttribute('aria-label')).toContain('Test Todo');
    });
  });
});
