class CreateQtasks < ActiveRecord::Migration[5.0]
  def change
    create_table :qtasks do |t|
      t.string :text

      t.timestamps
    end
  end
end
