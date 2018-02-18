class IntroduceHiddenSection < ActiveRecord::Migration[5.0]
  def up
    qtask = Type.find_by(name: 'QTask')
    if !qtask
      task = Type.find_by(name: 'Task')
      qtask = task.dup
    end
    if qtask
      qtask.attribute_groups << ['hidden', []]

      qtask.save
    end
  end

  def down
  end
end
