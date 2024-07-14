defmodule TestProjectTest do
  use ExUnit.Case
  doctest TestProject

  test "greets the world" do
    assert TestProject.hello("Joe") == "Hello Joe!"
  end
end
