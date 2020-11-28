defmodule GraphQl.Schema.User do
  use GraphQl.Schema.Base
  alias GraphQl.Resolvers.{
    User,
    Payments
  }

  input_object :user_attributes do
    field :name,     :string
    field :email,    :string
    field :password, :string
    field :avatar,   :upload_or_url
  end

  input_object :publisher_attributes do
    field :name,        :string
    field :description, :string
    field :avatar,      :upload_or_url
    field :phone,       :string
    field :address,     :address_attributes
  end

  input_object :address_attributes do
    field :line1,   non_null(:string)
    field :line2,   non_null(:string)
    field :city,    non_null(:string)
    field :state,   non_null(:string)
    field :country, non_null(:string)
    field :zip,     non_null(:string)
  end

  input_object :webhook_attributes do
    field :url, non_null(:string)
  end

  object :user do
    field :id,          non_null(:id)
    field :name,        non_null(:string)
    field :email,       non_null(:string)
    field :customer_id, :string
    field :publisher,   :publisher, resolve: dataloader(User)
    field :phone,       :string
    field :address,     :address

    field :jwt, :string, resolve: fn
      %{id: id, jwt: jwt}, _, %{context: %{current_user: %{id: id}}} -> {:ok, jwt}
      _, _, %{context: %{current_user: %{}}} -> {:error, "you can only query your own jwt"}
      %{jwt: jwt}, _, _ -> {:ok, jwt}
    end

    field :avatar, :string, resolve: fn
      user, _, _ -> {:ok, Core.Storage.url({user.avatar, user}, :original)}
    end

    field :background_color, :string, resolve: fn
      user, _, _ -> {:ok, User.background_color(user)}
    end

    connection field :cards, node_type: :card do
      resolve &Payments.list_cards/3
    end

    timestamps()
  end

  object :address do
    field :line1,   :string
    field :line2,   :string
    field :city,    :string
    field :state,   :string
    field :country, :string
    field :zip,     :string
  end

  object :persisted_token do
    field :id,    :id
    field :token, :string

    timestamps()
  end

  object :publisher do
    field :id,           :id
    field :name,         non_null(:string)
    field :description,  :string
    field :account_id,   :string
    field :owner,        :user, resolve: dataloader(User)
    field :phone,        :string
    field :address,      :address

    field :avatar, :string, resolve: fn
      publisher, _, _ -> {:ok, Core.Storage.url({publisher.avatar, publisher}, :original)}
    end

    field :repositories, list_of(:repository) do
      resolve fn publisher, _, %{context: %{loader: loader}} ->
        manual_dataloader(
          loader, User, {:many, Core.Schema.Publisher}, repositories: publisher)
      end
    end

    timestamps()
  end

  object :webhook do
    field :id,     :id
    field :url,    :string
    field :secret, :string
    field :user,   :user, resolve: dataloader(User)

    timestamps()
  end

  object :webhook_response do
    field :status_code, non_null(:integer)
    field :body,        :string
    field :headers,     :map
  end

  connection node_type: :user
  connection node_type: :publisher
  connection node_type: :webhook
  connection node_type: :persisted_token


  object :user_queries do
    field :me, :user do
      middleware GraphQl.Middleware.Authenticated
      resolve fn _, %{context: %{current_user: user}} -> {:ok, user} end
    end

    connection field :tokens, node_type: :persisted_token do
      middleware GraphQl.Middleware.Authenticated
      resolve &User.list_tokens/2
    end

    field :publisher, :publisher do
      middleware GraphQl.Middleware.Authenticated
      arg :id, :id

      resolve &User.resolve_publisher/2
    end

    connection field :users, node_type: :user do
      middleware GraphQl.Middleware.Authenticated
      resolve &User.list_users/2
    end

    connection field :publishers, node_type: :publisher do
      middleware GraphQl.Middleware.Authenticated
      resolve &User.list_publishers/2
    end

    connection field :webhooks, node_type: :webhook do
      middleware GraphQl.Middleware.Authenticated

      resolve &User.list_webhooks/2
    end
  end

  object :user_mutations do
    field :login, :user do
      arg :email, non_null(:string)
      arg :password, non_null(:string)

      resolve safe_resolver(&User.login_user/2)
    end

    field :create_token, :persisted_token do
      middleware GraphQl.Middleware.Authenticated
      resolve safe_resolver(&User.create_token/2)
    end

    field :delete_token, :persisted_token do
      middleware GraphQl.Middleware.Authenticated
      arg :id, non_null(:id)

      resolve safe_resolver(&User.delete_token/2)
    end

    field :signup, :user do
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.signup_user/2)
    end

    field :update_user, :user do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:user_attributes)

      resolve safe_resolver(&User.update_user/2)
    end

    field :create_publisher, :publisher do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:publisher_attributes)

      resolve safe_resolver(&User.create_publisher/2)
    end

    field :create_webhook, :webhook do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:webhook_attributes)

      resolve safe_resolver(&User.create_webhook/2)
    end

    field :ping_webhook, :webhook_response do
      middleware GraphQl.Middleware.Authenticated
      arg :id,   non_null(:id)
      arg :repo, non_null(:string)
      arg :message, :string

      resolve safe_resolver(&User.ping_webhook/2)
    end

    field :update_publisher, :publisher do
      middleware GraphQl.Middleware.Authenticated
      arg :attributes, non_null(:publisher_attributes)

      resolve safe_resolver(&User.update_publisher/2)
    end
  end
end